import { exec } from 'child_process'

export async function getLatestVersion(
  pkgName: string
): Promise<string | undefined> {
  if (pkgName) {
    return new Promise((resolve, reject) => {
      try {
        exec(
          `npm show ${pkgName} version`,
          {
            encoding: 'utf-8',
          },
          (err, latestVersion) => {
            if (err) return reject(err)
            resolve(latestVersion)
          }
        )
      } catch (error) {}
    })
  }
  return undefined
}
