//*****************************************************************************************
// ANIME ENTRY DATA STRUCTURE
//*****************************************************************************************
function AnimeEntry(
	status, title, numWatched, numTotal, stars, 
	cover, aid, genres, themes, description) 
{
	this.status = status;
	this.title = title;
	this.numWatched = numWatched;
	this.numTotal = numTotal;
	this.stars = stars;
	this.cover = cover;
	this.aid = aid; // the anime id associated with ANN animeIds
	this.genres = genres;
	this.themes = themes;
	this.description = description;
}