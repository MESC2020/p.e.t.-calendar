# Productivity & Energy Task (P.E.T) calendar
This repository includes my Bachelor Thesis' program P.E.T. The program's main functionality are
- calendar
- data collection via self-assessment once an hour

More in depth explained: User is asked to specify how the last hour felt in terms of productivity and energy via self-assessment. This information is provided via Likert Scales that go from 1 (extremely low) to 7 (extremely high). The data is then displayed inside the calendar so that the user can now see at what point of the day they're the most/least energized. With this information, user may be able to schedule their week more efficiently and thus increasing their productivity directly or indirectly. 
Further, tasks are rated by user, again from 1 to 7, how demanding that task will be. That way, a mapping can take place between energy level and demanding level. For example, it'd be in user's interest to map a task with a demanding level of 5 to a time slot that has an energy level of 5 or more.

An auto-assign-button is provided to assign all tasks in pool automatically based on their demanding-level. 

Note: The privious mentioned button is only available if tasks are in pool and if there's sufficient information about the user's energy pattern. Sufficient means: A minimum of 16 time slots with energy level data, on minimum of 2 days, are provided. 

### Technologies
I used Electron, React, TypeScript, Tailwind and CSS/HTML. Main dependencies this program is relying on are but not limited to:
- [fullCalendar](https://fullcalendar.io/) for the main calendar functionalities
- [victory](https://formidable.com/open-source/victory/) for displaying data in a graph-style

### Launch & Deployment
The program can be run via craco & concurrently. Concurrently in this case makes sure that the development environment is booted not only in Electron but also on localhost in the web browser.
npm was used to manage dependencies.

#### Install
```
./npm install
```
To look for any missing dependencies and if there are missing ones they will be installed

#### Compile
```
./npm run compile
```
Compiles `electron files` only, based on `electron/tsconfig.json`

#### Run
```
./npm start
```
Compiles (important for electron) and starts the app in the development mode. It should start an Electron App. If needed, the program can also be found on this link: [http:localhost:3000](http://localhost:3000). 
If you apply edits in React, the page will automatically reload. Edits in Electron (`electron.ts` and `preload.ts`) need a re-start. 

#### Test
```
./npm run test
```
Launches the test runner in the interactive watch mode.
See the section about [running tests](https://create-react-app.dev/docs/running-tests/) for more information.
Due to time limit I was not able to implement my own tests.

#### Build
```
./npm run build
```
Builds the app for production to the `build` folder. This is a necessary step to distribute the app.

#### Deployment
```
./npm run dist:win
```
Creates Windows Distribution of the app based on `build` setting in `package.json`. This distribution, `.exe` can be found in the (auto-created) folder `dist`.

```
./npm run dist:mac
```
Not yet implemented 


### Roadmap
- Refactor Code
- Implement Testing
- Improve design
- Improve overall experience

### Authors and acknowledgment
#### Author
- Micha Eschmann

#### Acknowledgment
- Anastasia Ruvimova & Alexander Lill  // Supervisors
- Thomas Fritz, Prof. Dr.

### License
- Copyright protected &copy;
