declare module 'get-youtube-id' {
  interface GetYouTubeIdOptions {
    fuzzy?: boolean;
  }

  function getYouTubeId(url: string, options?: GetYouTubeIdOptions): string | null;

  export default getYouTubeId;
}
