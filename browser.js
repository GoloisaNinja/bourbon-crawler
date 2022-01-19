import puppeteer from 'puppeteer';

const startBrowser = async () => {
	let browser;
	try {
		console.log('opening the browser');
		browser = await puppeteer.launch({
			headless: false,
			args: ['--disable-setuid-sandbox'],
			ignoreHTTPSErrors: true,
		});
	} catch (error) {
		console.log('could not initiate browser', error);
	}
	return browser;
};

export default startBrowser;
