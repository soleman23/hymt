/**
 * Upload a generated image to the place-card Drive folder and hand back the
 * link that goes in the tracker (brief, step 4).
 *
 * The brief's hard rule — "never fabricate a Drive link if the upload didn't
 * actually succeed" — is enforced structurally rather than by care. This module
 * never builds a URL from an id. It uploads, then does a separate files.get for
 * webViewLink, and returns whatever Drive says. If Drive will not confirm the
 * file exists, there is no string to return and the caller cannot write a row.
 *
 * Multipart rather than resumable upload: these are single-digit-megabyte JPEGs
 * on a desktop connection, where resumable's extra round trip buys nothing. If
 * 4K masters ever go through here, revisit that.
 *
 * supportsAllDrives is set on every call because the tracker's own parent id
 * (0ABqgJOLwOpQbUk9PVA) is a Shared Drive, so the image folder is very likely
 * in one too. Without the flag, Shared Drive writes fail with a 404 that reads
 * like a permissions problem and sends you to the wrong place entirely.
 */
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { googleFetch } from "./google-auth.mjs";

const UPLOAD_ENDPOINT = "https://www.googleapis.com/upload/drive/v3/files";
const FILES_ENDPOINT = "https://www.googleapis.com/drive/v3/files";

const MIME_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export function mimeTypeFor(filename) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return MIME_BY_EXT[ext] ?? "application/octet-stream";
}

/**
 * Upload one local file into the destination folder, flat.
 *
 * @returns { id, name, webViewLink } — webViewLink straight from Drive.
 */
export async function uploadImage(getAccessToken, config, localPath, driveFilename) {
  const bytes = await readFile(localPath);
  if (bytes.length === 0) {
    /* A zero-byte file means the download leg produced nothing. Uploading it
       would put a broken image behind a link the sheet then calls Complete. */
    throw new Error(`${localPath} is empty — refusing to upload a zero-byte image.`);
  }

  const name = driveFilename || basename(localPath);
  const contentType = mimeTypeFor(name);
  const metadata = { name, parents: [config.driveFolderId] };

  /* Hand-built multipart/related. FormData would give multipart/form-data,
     which the Drive upload endpoint does not accept for this uploadType. */
  const boundary = `hymt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`,
      "utf8"
    ),
    bytes,
    Buffer.from(`\r\n--${boundary}--\r\n`, "utf8"),
  ]);

  const url =
    `${UPLOAD_ENDPOINT}?uploadType=multipart&supportsAllDrives=true` +
    `&fields=${encodeURIComponent("id,name,webViewLink,size")}`;

  const res = await googleFetch(getAccessToken, url, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    body,
  });
  const created = await res.json();

  if (!created.id) {
    throw new Error(`Drive accepted the upload but returned no file id: ${JSON.stringify(created)}`);
  }

  /* Read the link back rather than trusting the create response, and rather
     than assembling drive.google.com/file/d/{id}/view by hand. A separate
     files.get is also the cheapest possible proof the file is really there. */
  const link = await getWebViewLink(getAccessToken, created.id);
  return { id: created.id, name: created.name ?? name, webViewLink: link };
}

/**
 * Fetch a file's webViewLink. Throws if Drive will not confirm the file or has
 * no link for it — the caller must not fall back to a constructed URL.
 */
export async function getWebViewLink(getAccessToken, fileId) {
  const url =
    `${FILES_ENDPOINT}/${encodeURIComponent(fileId)}` +
    `?supportsAllDrives=true&fields=${encodeURIComponent("id,name,webViewLink,trashed")}`;

  const res = await googleFetch(getAccessToken, url);
  const file = await res.json();

  if (file.trashed) {
    throw new Error(`Drive file ${fileId} exists but is in the trash — not writing its link.`);
  }
  if (!file.webViewLink) {
    throw new Error(`Drive returned no webViewLink for ${fileId} — refusing to invent one.`);
  }
  return file.webViewLink;
}

/**
 * Check the destination folder is reachable and writable before a run starts.
 *
 * Worth its own round trip: the alternative is discovering the folder id is
 * wrong, or the token's drive.file scope cannot see it, after the first image
 * has already been generated.
 */
export async function assertFolderWritable(getAccessToken, config) {
  const url =
    `${FILES_ENDPOINT}/${encodeURIComponent(config.driveFolderId)}` +
    `?supportsAllDrives=true&fields=${encodeURIComponent("id,name,mimeType,capabilities/canAddChildren")}`;

  let folder;
  try {
    const res = await googleFetch(getAccessToken, url);
    folder = await res.json();
  } catch (err) {
    if (err.status === 404) {
      throw new Error(
        `Drive folder ${config.driveFolderId} is not visible to this token.\n\n` +
          `With the narrow drive.file scope, a folder is only reachable once it has been ` +
          `shared with the authorising account, or opened through the picker at least once. ` +
          `Confirm the folder id in config.json and that the account behind the refresh ` +
          `token can open it in a browser.`
      );
    }
    throw err;
  }

  if (folder.mimeType !== "application/vnd.google-apps.folder") {
    throw new Error(`Drive id ${config.driveFolderId} is a ${folder.mimeType}, not a folder.`);
  }
  if (folder.capabilities && folder.capabilities.canAddChildren === false) {
    throw new Error(
      `The authorising account can see "${folder.name}" but cannot add files to it. ` +
        `It needs Editor access on the folder.`
    );
  }
  return folder;
}
