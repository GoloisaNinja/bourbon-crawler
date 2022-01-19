import pageScraper from './pageScraper.js';
import fs from 'fs';
const scraperController = async (browserInstance) => {
	let browser;
	try {
		browser = await browserInstance;
		let scrapedData = {};
		scrapedData['bourbon'] = await pageScraper(browser);
		await browser.close();
		fs.writeFile(
			'data.json',
			JSON.stringify(scrapedData),
			'utf8',
			function (err) {
				if (err) {
					return console.log(err);
				}
				console.log('data scraped and saved successfully...');
			}
		);
	} catch (error) {
		console.log('could not resolve browser instance', error);
	}
};
export default scraperController;
