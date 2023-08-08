const _ = require("lodash");
const { DateTime } = require("luxon");
const slugify = require("slugify");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const pluginTOC = require('eleventy-plugin-toc');
const pluginMermaid = require("@kevingimbel/eleventy-plugin-mermaid");

module.exports = function(config) {
    config.setUseGitIgnore(true);
    config.addPassthroughCopy("./src/_assets/css/**/*.min.css");
    config.addPassthroughCopy("./src/_assets/js/**/*.min.js");
    config.addPassthroughCopy("./src/_assets/img/**/*");
    config.addPassthroughCopy("./src/_assets/svg/**/*");

    /* =========================  Short Codes ======================== */
    config.addShortcode("dateToday", () => `${new Date().toLocaleString(DateTime.DATE_HUGE)}`);
    config.addShortcode("currentYear", () => `${new Date().getFullYear()}`);

    /* =========================  Custom Filters ======================== */
    config.addNunjucksFilter("take", (collection, count) => collection.slice(0, count || 10));

    config.addNunjucksFilter("localeDate", (dateObject) => {
        return DateTime
            .fromJSDate(dateObject)
            .toLocaleString(DateTime.DATE_HUGE);
    });

    config.addFilter("ymdDateFormat", (date) => {
        // Create a new Date object from the input date string
        var inputDate = new Date(date);

        // Extract the year, month, and day components from the date object
        var year = inputDate.getFullYear();
        var month = ("0" + (inputDate.getMonth() + 1)).slice(-2);
        var day = ("0" + inputDate.getDate()).slice(-2);

        // Return the date string in the "YYYY/MM/DD" format
        return year + "/" + month + "/" + day;
      });

    config.addFilter("excerpt", (post) => {
        const content = post.replace(/(<([^>]+)>)/gi, "");
        return content.substr(0, content.lastIndexOf(" ", 250)) + "...";
    });

    config.addFilter("slugify", (str) => {
        if (!str) { return; }
        return slugify(str, {
            lower: true,
            strict: true,
            remove: /["]/g,
        });
    });

    config.addNunjucksFilter("sortedCollection", (collection) => collection.sort());

    /* =========================  Articles Config ======================== */
    config.addCollection("publishedPosts", (collection) => { return _
        .chain(collection.getAllSorted())
        .filter((post) => post.url && post.inputPath.startsWith('./src/articles/')  && !post.data.draft)
        .reverse()
        .value();
    });

    config.addCollection("postsByCategory", (collection) => {
        return _
            .chain(collection.getAllSorted())
            .filter((post) => post.url && post.inputPath.startsWith('./src/articles/') && !post.data.draft)
            .groupBy((post) => post.data.categories)
            .toPairs()
            .reverse()
            .value();
    });

    /* =========================  Markdown Overrides ======================== */
    const markdownItAnchorOptions = {
        level: [1, 2, 3],
        slugify: (str) => slugify(str, {
            lower: true,
            strict: true,
            remove: /["]/g,
        })
    };

    // This is the part that tells 11ty to swap to our custom config
    let markdownLibrary = markdownIt().use(markdownItAnchor, markdownItAnchorOptions);

    config.setLibrary("md", markdownLibrary);

    /* =========================  Plugins ======================== */
    config.addPlugin(pluginTOC, {
        tags: ['h1', 'h2', 'h3'],
        wrapper: 'nav',
        ul: true,
        flat: false
    });

    config.addPlugin(pluginMermaid);

    return {
        dir: {
            input: "src",
            output: "docs"
        }
    };
}