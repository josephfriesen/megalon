const { SlashCommandBuilder } = require("discord.js");
const puppeteer = require("puppeteer");
const { parse, stringify } = require("query-string");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("random-workout")
    .setDescription("Fetch a random workout from Darebee.com and post it."),
  async execute(interaction) {
    const { channel } = interaction;
    await interaction.reply("Hang on, fetching a random workout...");
    try {
      // open browser window to darebee workouts
      const browser = await puppeteer.launch();
      let page = await browser.newPage();
      await Promise.all([
        page.goto("https://www.darebee.com/filter"),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);

      // navigate to last page in workouts list
      const linkToLast = await page.waitForSelector("a.page.action.last");
      if (linkToLast) {
        await Promise.all([
          linkToLast.evaluate((l) => l.click()),
          page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);
      }

      // filter workouts that require equipment
      const radio = await page.waitForSelector(
        "input[type='radio'][name='attr.ct19.value'][value='none']"
      );
      if (radio) {
        await Promise.all([radio.evaluate((r) => r.click())]);
      } else {
        throw new Error("couldn't find filter button, aborting.");
      }

      // navigate to random page from 1 to last
      const hash = parse(page.url().split("#")[1]);
      const max = parseInt(hash.page);
      const randomPage = Math.floor(Math.random() * max) + 1;
      const nextUrl = `https://www.darebee.com/filter#${stringify({
        ...hash,
        page: randomPage,
      })}`;
      page = await browser.newPage();
      await Promise.all([
        page.goto(nextUrl),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);

      // select one workout on page and open it
      const workouts = await page.$$("div.item.product.product-item");
      const randWorkout = workouts[Math.floor(Math.random() * workouts.length)];
      if (randWorkout) {
        const link = await randWorkout.waitForSelector("a");
        await Promise.all([
          link.click(),
          page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);
      } else {
        throw new Error("couldn't grab random workout, aborting");
      }

      // send message
      const workoutUrl = page.url();
      const img = await page.waitForSelector("figure.item-image > img");
      const imgSrc = await img.getProperty("src");
      const imgUrl = await imgSrc.jsonValue();

      await channel.send({
        content: `Here's your random workout. Go like this :muscle: when you've finished it, show off to all the other pipsqueaks in here. More info: ${workoutUrl}`,
        files: [imgUrl],
      });

      await browser.close();
    } catch (err) {
      await channel.send("Yuuh-oh, something went wrong.");
      console.error(err);
    }
  },
};
