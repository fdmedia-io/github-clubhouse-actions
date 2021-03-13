const github = require('@actions/github');
const core = require('@actions/core');

const ch = require('./src/clubhouse');

async function run() {
    try {
        const { payload, eventName } = github.context;
        let updatedStories;
        if (eventName === "release") {
            const { body, html_url } = payload.release;
            const addReleaseInfo = (core.getInput('addReleaseInfo') === 'true');
            updatedStories = await ch.releaseStories(
                body,
                core.getInput('endStateName'),
                html_url,
                addReleaseInfo
            );
        } else if (eventName === "pull_request") {
            const { title, body } = payload.pull_request;
            const { ref } = payload.pull_request.head;
            const content = `${title} ${body} ${ref}`;
            updatedStories = await ch.transitionStories(
                content,
                core.getInput('endStateName')
            );
        } else if (eventName === "issues") {
            let links = payload.issue.milestone ?
                [payload.issue.html_url, payload.issue.milestone.html_url] :
                [payload.issue.html_url];
            await ch.createStory(
                payload.issue.number,
                payload.issue.title,
                payload.issue.body,
                links
            );
        }
        else if (eventName === "milestone") {
            await ch.createEpic(
                payload.milestone.number,
                payload.milestone.title,
                payload.milestone.description,
                payload.milestone.created_at,
                payload.milestone.due_on
            );
        } else {
            throw new Error("Invalid event type");
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
