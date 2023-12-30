import { DiscogsClient } from "@lionralfs/discogs-client";
export class SongManager {
    constructor(db) {
        this.db = db;
        this.discogs = new DiscogsClient({ auth: { userToken: process.env.DISCOGS_TOKEN } }).database();
    }
    async addArtist(name, cover) {
        const artist = await this.db.artist.findMany({
            where: { name },
        });
        if (artist.length > 0) {
            return artist[0].id;
        }
        const data = await this.db.artist.create({
            data: { name },
        });
        return data.id;
    }
    async addAlbum(name, artistId) {
        const album = await this.db.album.findFirst({
            where: { title: name },
        });
        if (album)
            return album.id;
        const data = await this.db.album.create({
            data: {
                title: name,
                artistId: artistId,
            },
        });
        return data.id;
    }
    async addSong(data) {
        const { title, albumId, artistId, duration, featuredArtistsIds, filename, coverArtFormat, } = data;
        const { id } = await this.db.song.create({
            data: {
                title: title,
                album: { connect: { id: albumId } },
                artist: { connect: { id: artistId } },
                duration,
                featuredArtistsIds,
                filename,
                coverArtFormat,
            },
        });
        return id;
    }
    async addSongToDB(song) {
        if (song === undefined)
            return;
        const artist = await this.addArtist(song.artist);
        const featuredArtists = await Promise.all(song.featuredArtists.map(async (e) => {
            return (await this.addArtist(e)).toString();
        }));
        const albumId = await this.addAlbum(song.album, artist);
        return this.addSong({
            title: song.title,
            albumId: albumId,
            artistId: artist,
            duration: song.duration,
            filename: song.filename,
            featuredArtistsIds: featuredArtists.join(" "),
            coverArtFormat: song.coverArtFormat,
        });
    }
}
