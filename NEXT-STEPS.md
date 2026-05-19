# Next Steps

There are three functionalites that we are intending to provide and they does not exist yet:

- Auth System: Auth would restrict people from using certain features and not the whole app like reviewing or using the AR, AI assistants etc.
- AR: We have no idea how to implement this one yet
- Assistant: Simple assistant backed with gemini free modules
- Gallery System: The current gallery system is very basic we have like 20 images in the app and instead we need to have a storage in the backend and a way to fetch from the backend to the mobile. The fetching functionality is already kinda implemented (just switching the source of the images) but we need to implement the backend storage and fetching.
- Review System: We need to implement a review system where users can review the app and really get a review of each place. The way this one is going to work is indeed very simple. We hardcode the name of the places in the backend as an enum. Then we store a reiview in a review table with the place name, the review text and the rating.