import Genius from "genius-lyrics";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
export class LyricsProvider {
	genius: Genius.Client;
	constructor(public lyricPath: string) {
		this.genius = new Genius.Client(process.env.GENIUS_TOKEN);
	}
	async findLyrics(artist: string, title: string, featuredArtists?: string[]) {
		const file = await readFile(
			join(this.lyricPath, `${artist} - ${title}.lrc`),
			"utf-8",
		);
		if (file) return { source: "file", lyrics: file };
		featuredArtists.push(artist);
		const geniusTitle = title.replaceAll("(", "").replaceAll(")", "");
		let source = "lrclib";
		let lyrics = await fetch(
			`https://lrclib.net/api/search?track_name=${title}&artist_name=${artist}`,
		).then((res) => res.json());
		// if lyrics aren't on lrclib, try genius
		if (lyrics?.length === 0) {
			const search = await this.genius.songs.search(
				`${geniusTitle} ${featuredArtists ? "" : artist}`,
			);
			// if multiple artists, search without artistname and try to match ourselves

			const song = featuredArtists
				? search.filter((s) =>
						featuredArtists.includes(s.artist.name.split("&")[0].trim()),
				  )[0]
				: search[0];

			lyrics = await song?.lyrics();
			source = "genius";
		} else {
			const firstSynced = lyrics.find((l) => l.syncedLyrics);
			if (firstSynced) {
				lyrics = firstSynced?.syncedLyrics;
			} else {
				lyrics = lyrics[0].plainLyrics;
			}
		}

		if (lyrics)
			await writeFile(
				join(this.lyricPath, `${artist} - ${title}.lrc`),
				lyrics as string,
			);
		if (!lyrics) console.log(artist, title, "no lyrics found");
		return lyrics
			? {
					source,
					lyrics,
			  }
			: undefined;
	}
}
