// Links into the admin web app.
export function useWebLinks() {
  const { webBaseUrl } = useRuntimeConfig().public

  return {
    loginUrl: webBaseUrl,
    registerUrl: `${webBaseUrl}/register`,
  }
}
