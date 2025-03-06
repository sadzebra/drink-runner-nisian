# drink-runner-nisien

A react application created to solve the problem of how will make the drink run within the office. The application uses React and Bootstraps as 
these tools felt appropriate tool to use to easily manage data within the application and designing a UI.

The application makes use of a reserve proxy that has been configure in the `docker-compose.yml` file. This allows access to the APIs on the backend. 

## Installation

In the root run `docker compose up --build`

To run the application outside of docker, navigate to the `frontend/` directory and run `npm install`. After the dependancies have been installed
run `npm start`.

This should install dependancies and set up the container

## App Flow
 - Start a new round
 - Add a new user (optional)
 - Select a user
 - input drink choice
 	- Drink type
 	- extras Surgar etc.
 	- Instructions any special directions to make the drink
 - Add another user or complete the round

## The App
In your browser navigate to `localhost` this will point to port `80` which will use the reverse proxy server allowing access to the APIs.

## Future Updates and Ideas
 - Gamification - Allow each drink runner to earn points for each round they make, this could be used in different ways 
 	- Rewarding the runner with the most points 
 	- Use points to determine who should make a run, if someone has a lot of points, they'll be less likely to be selected this time
 - Better error handling
 - Somehow notify the person that is picked for the run, email, text, slack, teams or email
 - Abstract functionality into react components
 - Implement better state management
 - improve UI