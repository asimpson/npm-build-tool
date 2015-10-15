import watch from "watch";
import tinylr from "tiny-lr";
import nodemon from "nodemon";
import shell from "shelljs";
import exit from "exit-hook";

tinylr().listen(35729, function() {
  console.log('livereload up...');
});

let tinyServer = tinylr();
const delay = 1200;
const options = {
  ignoreDotFiles: true
};

nodemon({
  script: 'app.js'
});

nodemon.on('start', function () {
  console.log('App has started...');
});

nodemon.on('restart', function (files) {
  console.log('App restarted due to: ', files);
});

function delayReload(file) {
  tinylr.changed(file);
}

watch.createMonitor('src/data', options, function(monitor) {
  monitor.on("changed", (f, curr, prev) => {
    setTimeout(delayReload, delay, f);
  });
});

watch.createMonitor('src/patterns', options, function(monitor) {
  monitor.on("changed", (f, curr, prev) => {
    setTimeout(delayReload, delay, f);
  });

  monitor.on("created", (f, stat) => {
    setTimeout(delayReload, delay, f);
  });
});

watch.createMonitor('dist', options, function(monitor) {
  monitor.on("changed", (f, curr, prev) => {
    tinylr.changed(f);
  });

  monitor.on("created", (f, stat) => {
    tinylr.changed(f);
  });
});

watch.createMonitor('src/icons', options, function(monitor) {
  monitor.on("changed", (f, curr, prev) => {
    shell.exec('npm run icons');
  });

  monitor.on("created", (f, stat) => {
    shell.exec('npm run icons');
  });
});

watch.createMonitor('src/scss', options, function(monitor) {
  monitor.on("changed", (f, curr, prev) => {
    shell.exec('npm run sass');
  });

  monitor.on("created", (f, stat) => {
    shell.exec('npm run sass');
  });
});

watch.createMonitor('src/public', options, function(monitor) {
  monitor.on("changed", (f, curr, prev) => {
    shell.exec('npm run copy');
  });

  monitor.on("created", (f, stat) => {
    shell.exec('npm run copy');
  });
});

exit(function () {
  console.log('♻  cleaning up...');
  tinyServer.close();
});
