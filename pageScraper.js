const pageScraper = async (browser) => {
	const url = 'https://whiskeyraiders.com/archive/?sort=bourbon';
	let page = await browser.newPage();
	console.log(`navigating to ${url}`);
	await page.goto(url);
	let scrapedData = [];
	const scrapeCurrentPage = async () => {
		await page.waitForSelector('.dataTables_wrapper');
		let urls = await page.$$eval('table tbody > tr', (links) => {
			links = links.filter((link) => link.querySelector('.sorting_1'));
			links = links.map(
				(el) => el.querySelector('td > a').href + `/?section=house`
			);
			return links;
		});
		let pagePromise = (link) =>
			new Promise(async (resolve, reject) => {
				let dataObj = {};
				let newPage = await browser.newPage();
				await newPage.goto(link);
				await newPage.waitForSelector('.o-spirit-stats-section');

				let priceSpanObj = await newPage.$$eval(
					'ul > .o-spirit-stat_price > div > .o-spirit-price-value-highlighted',
					(spans) => {
						let priceArr = [];
						if (spans.length > 0) {
							for (let span in spans) {
								priceArr.push('$');
							}
						}
						return priceArr;
					}
				);

				let reviewObj = {};

				const checkForElement = async (selector) => {
					const element = await newPage.$(selector);
					if (element) {
						return true;
					}
					return false;
				};

				const introEl = await checkForElement('.o-spirit-house-review-intro');
				const noseEl = await checkForElement('.o-spirit-house-review-nose');
				// appears to be a spelling error on the whiskey raiders site taste is tatse on li item
				// this could be trouble for future scrapes if error is corrected
				const tasteEl = await checkForElement('.o-spirit-house-review-tatse');
				const finishEl = await checkForElement('.o-spirit-house-review-finish');
				const overallEl = await checkForElement(
					'.o-spirit-house-review-overall'
				);
				const scoreEl = await checkForElement('.o-spirit-house-review-rank');
				const authorEl = await checkForElement('.o-spirit-author');

				const abvEl = await checkForElement(
					'.o-spirit-stats-section > ul > .o-spirit-stat_abv'
				);

				if (introEl) {
					reviewObj.intro = await newPage.$eval(
						'.o-spirit-house-review-intro > p',
						(text) => text.textContent
					);
				} else {
					reviewObj.intro = null;
				}

				if (noseEl) {
					reviewObj.nose = await newPage.$eval(
						'.o-spirit-house-review-nose > p',
						(text) => text.textContent
					);
				} else {
					reviewObj.nose = null;
				}

				if (tasteEl) {
					reviewObj.taste = await newPage.$eval(
						'.o-spirit-house-review-tatse > p',
						(text) => text.textContent
					);
				} else {
					reviewObj.taste = null;
				}

				if (finishEl) {
					reviewObj.finish = await newPage.$eval(
						'.o-spirit-house-review-finish > p',
						(text) => text.textContent
					);
				} else {
					reviewObj.finish = null;
				}

				if (overallEl) {
					reviewObj.overall = await newPage.$eval(
						'.o-spirit-house-review-overall > p',
						(text) => text.textContent
					);
				} else {
					reviewObj.overall = null;
				}

				if (scoreEl) {
					reviewObj.score = await newPage.$eval(
						'.o-spirit-house-review-rank > p',
						(text) => text.textContent
					);
				} else {
					reviewObj.score = null;
				}

				if (authorEl) {
					reviewObj.author = await newPage.$eval(
						'.o-spirit-author > .o-spirit-author__name',
						(text) => text.textContent
					);
				} else {
					reviewObj.author = null;
				}

				dataObj['title'] = await newPage.$eval(
					'.o-spirit-stats-section > h1',
					(text) => text.textContent
				);
				dataObj['image'] = await newPage.$eval(
					'.o-spirit-image-section > div',
					(el) => el.querySelector('img').src
				);
				dataObj['distiller'] = await newPage.$eval(
					'.o-spirit-stats-section > ul > .o-spirit-stat_distiller > p',
					(text) => text.textContent
				);
				dataObj['bottler'] = await newPage.$eval(
					'.o-spirit-stats-section > ul > .o-spirit-stat_bottler > p',
					(text) => text.textContent
				);

				if (abvEl) {
					dataObj['abv'] = await newPage.$eval(
						'.o-spirit-stats-section > ul > .o-spirit-stat_abv > p',
						(text) => text.textContent
					);
				} else {
					dataObj['abv'] = null;
				}

				dataObj['age'] = await newPage.$eval(
					'.o-spirit-stats-section > ul > .o-spirit-stat_age > p',
					(text) => text.textContent
				);
				dataObj['price'] = priceSpanObj;
				dataObj['review'] = reviewObj;
				resolve(dataObj);
				await newPage.close();
			});

		for (let link in urls) {
			let currentPageData = await pagePromise(urls[link]);
			scrapedData.push(currentPageData);
			//console.log(currentPageData);
		}

		let nextButtonExist = false;
		try {
			const noNextButton = await page.$eval(
				'.paginate_button.next.disabled',
				(text) => text.textContent
			);
			nextButtonExist = false;
		} catch (error) {
			nextButtonExist = true;
		}

		if (nextButtonExist) {
			await page.click('#table_next');
			return scrapeCurrentPage();
		}

		await page.close();
		return scrapedData;
	};
	let data = await scrapeCurrentPage();
	console.log(data);
	return data;
};
export default pageScraper;
