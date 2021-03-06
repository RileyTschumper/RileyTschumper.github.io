/*
  Intializes index.html on body load
  Populates navigation bar and news items
*/
function InitIndex() {
  var language = "en";
  //fetches the list of languages that can be translated, then populates the navigation bar
  getTranslationListPromise().then(data => getNavData(populateNav, data, language, "json/nav.json"));
  
  getData(populateBio, undefined, "json/bio.json");
  getData(populateNews, undefined, "json/news.json");
}

/*
  Initializes resume.html on body load
  Populates navigation bar and resume items
*/
function InitResume() {
  var language = "en";
  //fetches the list of languages that can be translated, then populates the navigation bar
  getTranslationListPromise().then(data => getNavData(populateNav, data, language, "json/nav.json"));

  getData(populateResume, undefined, "json/resume.json");
}

/*
  Initializes projects.html on body load
  Populates navigation bar and project items
*/
function InitProjects() {
  var language = "en";
  //fetches the list of languages that can be translated, then populates the navigation bar
  getTranslationListPromise().then(data => getNavData(populateNav, data, language, "json/nav.json"));

  getData(populateProjects, undefined, "json/projects.json");
}

/*
  Called on when a language from the dropdown translate menu is clicked.
  It is passed a two letter language code used by the api to translate the text
*/
function translatePage(language){
  //fetches the list of languages that can be translated, then populates the navigation bar
  getTranslationListPromise().then(data => getNavData(populateNav, data, language, "json/nav.json"));

  //checks what page it is currently on, translates the page respectively
  if(document.getElementById("news") != null){
    getData(populateBio, language, "json/bio.json");
    getData(populateNews, language, "json/news.json");
  }
  else if(document.getElementById("resume") != null){
    getData(populateResume,language,"json/resume.json");
  }
  else if (document.getElementById("projects") != null){
    getData(populateProjects, language, "json/projects.json");
  }
}

/*
  A specific function required to get the data for the navigation bar,
  due to the necessity of the translateData list
*/
var getNavData = function(populateLocation, translateData, language, url) {
  var req = new XMLHttpRequest();

  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      populateLocation(JSON.parse(req.responseText), translateData, language);
    }
  };

  req.open("GET", url, true);
  req.send();
};

/*
  HTTP request for a JSON file.
  Parameters: function fo where to pass JSON once recieved, language code, url of JSON
*/
var getData = function(populateLocation, language, url) {
  var req = new XMLHttpRequest();

  req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
      populateLocation(JSON.parse(req.responseText), language);
    }
  };

  req.open("GET", url, true);
  req.send();
};

/*
  Performs an HTTP request with the text that is going to be translated,
  and the language code of the requested language
*/
var translatePromise = function(text, language){
  var p = new Promise((resolve,reject) => {
    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
        var data = JSON.parse(req.responseText);
        resolve(data.text[0]);
      }
      else if (req.readyState == 4) {
        if(req.response != ""){
          var data = JSON.parse(req.response);
          alert("Error code: " + data.code + "\nMessage: " + data.message);
        }
      }
    };
  
    var url = "https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20190310T205737Z.4bb98a2cc12eb124.f6b1e507245c5568148391050b6e4906c0a926c8&text=" + text + "&lang=" + language;
    req.open("GET", url, true);
    req.send();

  });
  return p;
}

/*
  Gets the list of language that are able to be translated.
  This is used to populate the dropdown menu.
*/
function getTranslationListPromise(){
  var p = new Promise((resolve,reject) => {
    var req = new XMLHttpRequest();

    req.onreadystatechange = function() {
      if (req.readyState == 4 && req.status == 200) {
        var data = JSON.parse(req.response);
        resolve(data);
      }
      else if (req.readyState == 4) {
        if(req.response != ""){
          var data = JSON.parse(req.response);
          alert("Error code: " + data.code + "\nMessage: " + data.message);
        }
      }
    };

    var url = "https://translate.yandex.net/api/v1.5/tr.json/getLangs?key=trnsl.1.1.20190310T205737Z.4bb98a2cc12eb124.f6b1e507245c5568148391050b6e4906c0a926c8&ui=en";
    req.open("GET", url, true);
    req.send();
  });
  return p;
}

/*
  Dynamically populates index.html page with data from bio.json
*/
function populateBio(data, language){
  if(typeof language !== "undefined"){
    document.getElementById("bio_container").innerHTML = "";

    var image = document.createElement("img");
    image.setAttribute("src",data.image);
    document.getElementById("bio_container").appendChild(image);

    var bio = document.createElement("p");
    translatePromise(data.biography, language).then(data => {
      bio.innerHTML = data;
    });
    document.getElementById("bio_container").appendChild(bio);
  }
  else{
    var image = document.createElement("img");
    image.setAttribute("src",data.image);
    document.getElementById("bio_container").appendChild(image);

    var bio = document.createElement("p");
    bio.innerHTML = data.biography;
    document.getElementById("bio_container").appendChild(bio);
  }
}

/*
  Dynamically populates projects.html page given data from projects.json file.
  Language will be undefined when page is initialized, causing no translation API requests
*/
async function populateProjects(data, language){
  //language will be undefined when page is first initialized, function overload
  if(typeof language !== "undefined"){
    //clears projects
    document.getElementById("projects").innerHTML = "";

    //creates h1 for page title
    var page_title = document.createElement("h1");
    translatePromise(data[0].page_title, language).then(data => {
      page_title.innerHTML = data;
    });
    document.getElementById("projects").appendChild(page_title);

    //creates unordered list
    var project_list = document.createElement("ul");
    project_list.id = "project_list";

    //adds each of the projects in the projects.json file
    for(var i = 1; i < data.length;  i++){
      //creates new list item for a project to be contained in
      var list_item = document.createElement("li");
      list_item.id = "projectId" + data[i].id;

      //adds project image
      var image = document.createElement("img");
      image.setAttribute("src",data[i].image_thumbnail);
      var onclickFunction = "openLightbox(" + data[i].id + ");";
      image.setAttribute("onclick",onclickFunction);
      list_item.appendChild(image);

      //div container that holds title and description
      var project_details = document.createElement("div");
      project_details.className = "project_details";
      list_item.appendChild(project_details);

      //project title
      var title = document.createElement("h3");
      title.id = "project_title" + data[i].id;
      await translatePromise(data[i].title, language).then(data => {
        title.innerHTML = data;
      });
      project_details.appendChild(title);

      //project description
      var project_description = document.createElement("p");
      project_description.id = "project_description" + data[i].id;
      project_description.className = "project_description";
      await translatePromise(data[i].description, language).then(data => {
        project_description.innerHTML = data;
      });
      project_details.appendChild(project_description);

      project_list.appendChild(list_item);

      //create modal div
      modalDiv = document.createElement("div");
      modalDiv.id = "myModal" + data[i].id;
      modalDiv.className = "modal";

      //creates close button X
      closeCursor = document.createElement("span");
      closeCursor.className = "close cursor";
      onclickFunction = "closeLightbox(" + data[i].id + ");";
      closeCursor.setAttribute("onclick",onclickFunction);
      closeCursor.innerHTML = "&times;"
      modalDiv.appendChild(closeCursor);

      modalContent = document.createElement("div");
      modalContent.className = "modal_content";

      //creates a slide for all images in the images array from projects.json file
      for(var j = 0; j < data[i].images.length; j++){
        var mySlide = document.createElement("div");
        mySlide.className = "mySlides";

        //creates a div for the slide number of each image
        var slideNumber = document.createElement("div");
        slideNumber.className = "numbertext";
        var numberText = (j + 1) + " / " + data[i].images.length;
        slideNumber.innerHTML = numberText;
        mySlide.appendChild(slideNumber);

        //creates image tag
        var slideImage = document.createElement("img");
        slideImage.setAttribute("src",data[i].images[j]);
        mySlide.appendChild(slideImage);

        modalContent.appendChild(mySlide);
      }
      
      //previous arrow <
      var prev = document.createElement("a");
      prev.className = "prev";
      prev.setAttribute("onclick","plusSlides(-1," + data[i].id + ")");
      prev.innerHTML = "&#10094;";
      modalContent.appendChild(prev);

      //next arrow >
      var next = document.createElement("a");
      next.className = "next";
      next.setAttribute("onclick","plusSlides(1," + data[i].id + ")");
      next.innerHTML = "&#10095;";
      modalContent.appendChild(next);

      //caption container
      var captionContainer = document.createElement("div");
      captionContainer.id = "caption" + data[i].id;
      captionContainer.className = "caption_container";
      //caption heading
      var captionHeading = document.createElement("h3");
      captionHeading.id = "caption_heading" + data[i].id;
      captionContainer.appendChild(captionHeading);
      //caption paragraph
      var caption = document.createElement("p");
      caption.id = "caption_content" + data[i].id;
      captionContainer.appendChild(caption);
      //appends caption container to content div
      modalContent.appendChild(captionContainer);

      //appends content div to master modal div
      modalDiv.appendChild(modalContent);
      //append modal div to projects(hard coded into html file)
      document.getElementById("projects").appendChild(modalDiv);

    }
    //append project list to projects(hard coded into html file)
    document.getElementById("projects").appendChild(project_list);
  }
  else{
    //creates h1 for page title
    var page_title = document.createElement("h1");
    page_title.innerHTML = data[0].page_title;
    document.getElementById("projects").appendChild(page_title);

    //creates unordered list
    var project_list = document.createElement("ul");
    project_list.id = "project_list";

    //adds each of the projects in the projects.json file
    for(var i = 1; i < data.length;  i++){
      //creates new list item for a project to be contained in
      var list_item = document.createElement("li");
      list_item.id = "projectId" + data[i].id;

      //adds project image
      var image = document.createElement("img");
      image.setAttribute("src",data[i].image_thumbnail);
      var onclickFunction = "openLightbox(" + data[i].id + ");";
      image.setAttribute("onclick",onclickFunction);
      list_item.appendChild(image);

      //div container that holds title and description
      var project_details = document.createElement("div");
      project_details.className = "project_details";
      list_item.appendChild(project_details);

      //project title
      var title = document.createElement("h3");
      title.id = "project_title" + data[i].id;
      title.innerHTML = data[i].title;
      project_details.appendChild(title);

      //project description
      var project_description = document.createElement("p");
      project_description.id = "project_description" + data[i].id;
      project_description.className = "project_description";
      project_description.innerHTML = data[i].description;
      project_details.appendChild(project_description);

      project_list.appendChild(list_item);

      //create modal div
      modalDiv = document.createElement("div");
      modalDiv.id = "myModal" + data[i].id;
      modalDiv.className = "modal";

      //creates close button X
      closeCursor = document.createElement("span");
      closeCursor.className = "close cursor";
      onclickFunction = "closeLightbox(" + data[i].id + ");";
      closeCursor.setAttribute("onclick",onclickFunction);
      closeCursor.innerHTML = "&times;"
      modalDiv.appendChild(closeCursor);

      modalContent = document.createElement("div");
      modalContent.className = "modal_content";

      //creates a slide for all images in the images array from projects.json file
      for(var j = 0; j < data[i].images.length; j++){
        var mySlide = document.createElement("div");
        mySlide.className = "mySlides";

        //creates a div for the slide number of each image
        var slideNumber = document.createElement("div");
        slideNumber.className = "numbertext";
        var numberText = (j + 1) + " / " + data[i].images.length;
        slideNumber.innerHTML = numberText;
        mySlide.appendChild(slideNumber);

        //creates image tag
        var slideImage = document.createElement("img");
        slideImage.setAttribute("src",data[i].images[j]);
        mySlide.appendChild(slideImage);

        modalContent.appendChild(mySlide);
      }
      
      //previous arrow <
      var prev = document.createElement("a");
      prev.className = "prev";
      prev.setAttribute("onclick","plusSlides(-1," + data[i].id + ")");
      prev.innerHTML = "&#10094;";
      modalContent.appendChild(prev);

      //next arrow >
      var next = document.createElement("a");
      next.className = "next";
      next.setAttribute("onclick","plusSlides(1," + data[i].id + ")");
      next.innerHTML = "&#10095;";
      modalContent.appendChild(next);

      //caption container
      var captionContainer = document.createElement("div");
      captionContainer.id = "caption" + data[i].id;
      captionContainer.className = "caption_container";
      //caption heading
      var captionHeading = document.createElement("h3");
      captionHeading.id = "caption_heading" + data[i].id;
      captionContainer.appendChild(captionHeading);
      //caption paragraph
      var caption = document.createElement("p");
      caption.id = "caption_content" + data[i].id;
      captionContainer.appendChild(caption);
      //appends caption container to content div
      modalContent.appendChild(captionContainer);

      //appends content div to master modal div
      modalDiv.appendChild(modalContent);
      //append modal div to projects(hard coded into html file)
      document.getElementById("projects").appendChild(modalDiv);

    }
    //append project list to projects(hard coded into html file)
    document.getElementById("projects").appendChild(project_list);
  }
}

//changes modal from display = "none" to display = "block"
function openLightbox(id) {
  var elementId = "myModal" + id;
  document.getElementById(elementId).style.display = "block";
  showSlides(1, id);
}

//changes modal from display = "block" to display = "none"
function closeLightbox(id) {
  var elementId = "myModal" + id;
  document.getElementById(elementId).style.display = "none";
}

//global variable for slideIndex, default set to 1
var slideIndex = 1;

// Next/previous controls
function plusSlides(n, id) {
  showSlides(slideIndex += n, id);
}

// Shows slide based on slide number and id
function showSlides(n, id) {
  slideIndex = n;
  var i;
  var elementId = "myModal" + id;
  var modalById = document.getElementById(elementId);
  var slides = modalById.getElementsByClassName("mySlides");
  var captionHeading = document.getElementById("caption_heading" + id);
  var captionText = document.getElementById("caption_content" + id);
  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
  captionHeading.innerHTML = document.getElementById("project_title" + id).innerHTML;
  captionText.innerHTML = document.getElementById("project_description" + id).innerHTML;
}

function populateNav(data, translateData, language) {

  //clears nav
  document.getElementById("top-nav").innerHTML = "";

  var name = document.createElement("a");
  name.id = "name";
  name.setAttribute("href", data[0].home_link);
  translatePromise(data[0].name, language).then(data => {
    name.innerHTML = data;
  });
  
  document.getElementById("top-nav").appendChild(name);
  var navContainer = document.createElement("div");
  navContainer.className = "nav-container";

  var home = document.createElement("a");
  home.setAttribute("href", data[0].home_link);
  translatePromise(data[0].home, language).then(data => {
    home.innerHTML = data;
  });

  navContainer.appendChild(home);
  var projects = document.createElement("a");
  projects.setAttribute("href", data[0].projects_link);
  translatePromise(data[0].projects, language).then(data => {
    projects.innerHTML = data;
  });

  navContainer.appendChild(projects);
  var resume = document.createElement("a");
  resume.setAttribute("href", data[0].resume_link);
  translatePromise(data[0].resume, language).then(data => {
    resume.innerHTML = data;
  });

  navContainer.appendChild(resume);
  document.getElementById("top-nav").appendChild(navContainer);

  var dropdown = document.createElement("div");
  dropdown.id = "dropdown";
  var dropdown_button = document.createElement("button");
  dropdown_button.className = "dropdown_button";
  translatePromise(data[0].dropdown, language).then(data => {
    dropdown_button.innerHTML = data;
  });

  dropdown.appendChild(dropdown_button);

  var dropdown_content = document.createElement("div");
  dropdown_content.id = "dropdown_content";
  for(var key in translateData.langs){
    if(translateData.langs.hasOwnProperty(key)){
      var a = document.createElement("a");
      a.setAttribute("href","#");
      var function_call = "translatePage(\"" + key + "\");";
      a.setAttribute("onclick",function_call);
      a.innerHTML = translateData.langs[key]
      dropdown_content.appendChild(a);
    }
  }
  dropdown.appendChild(dropdown_content);
  navContainer.appendChild(dropdown);
}

/*
  Dynamically populates resume.html page given data from resume.json file.
  Language will be undefined when page is initialized, causing no translation API requests
*/
async function populateResume(data, language) {
  //language will be undefined when page is first initialized, function overloaded
  if(typeof language !== "undefined"){
    //clears resume
    document.getElementById("resume").innerHTML = "";

    for (var i = 0; i < data.length; i++) {
      //title
      var title = document.createElement("h1");
      await translatePromise(data[0].title, language).then(data => {
        title.innerHTML = data;
      });
      document.getElementById("resume").appendChild(title);

      //technical skills
      var skills = document.createElement("h2");
      await translatePromise(data[0].skills.title, language).then(data => {
        skills.innerHTML = data;
      });
      document.getElementById("resume").appendChild(skills);

      var skills_list = document.createElement("ul");

      for(var j = 0; j < data[0].skills.skills_list.length; j++){
        var skill = document.createElement("li");
        await translatePromise(data[0].skills.skills_list[j], language).then(data => {
          skill.innerHTML = data;
        });
        skills_list.appendChild(skill);
      }
      document.getElementById("resume").appendChild(skills_list);

      //work experience
      var work_experience = document.createElement("h2");
      await translatePromise(data[0].work_experience.title, language).then(data => {
        work_experience.innerHTML = data;
      });

      document.getElementById("resume").appendChild(work_experience);

      for(var z = 0; z < data[0].work_experience.jobs.length; z++){
        var job_title = document.createElement("h3");
        await translatePromise(data[0].work_experience.jobs[z].title, language).then(data => {
          job_title.innerHTML = data;
        });
        document.getElementById("resume").appendChild(job_title);

        var workplace = document.createElement("h4");
        if(data[0].work_experience.jobs[z].workplace_link){
          var job_link = document.createElement("a");
          job_link.setAttribute("href", data[0].work_experience.jobs[z].workplace_link);
          await translatePromise(data[0].work_experience.jobs[z].workplace, language).then(data => {
            job_link.innerHTML = data;
          });
          workplace.appendChild(job_link);
        }
        else{
          await translatePromise(data[0].work_experience.jobs[z].workplace, language).then(data => {
            workplace.innerHTML = data;
          });
        }
        document.getElementById("resume").appendChild(workplace);

        var duties = document.createElement("p");
        await translatePromise(data[0].work_experience.jobs[z].duties, language).then(data => {
          duties.innerHTML = data;
        });
        document.getElementById("resume").appendChild(duties);

      }

      //education
      var education = document.createElement("h2");
      await translatePromise(data[0].education.title, language).then(data => {
        education.innerHTML = data;
      });
      document.getElementById("resume").appendChild(education);

      var school = document.createElement("h3");
      var school_link = document.createElement("a");
      school_link.setAttribute("href", data[0].education.school_link);
      await translatePromise(data[0].education.school, language).then(data => {
        school_link.innerHTML = data;
      });
      school.appendChild(school_link);
      document.getElementById("resume").appendChild(school);

      var location = document.createElement("p");
      await translatePromise(data[0].education.location, language).then(data => {
        location.innerHTML = data;
      });
      document.getElementById("resume").appendChild(location);

      var degree = document.createElement("p");
      await translatePromise(data[0].education.degree, language).then(data => {
        degree.innerHTML = data;
      });
      document.getElementById("resume").appendChild(degree);

      var graduation = document.createElement("p");
      await translatePromise(data[0].education.graduation, language).then(data => {
        graduation.innerHTML = data;
      });
      document.getElementById("resume").appendChild(graduation);
    }
  }
  else{
    for (var i = 0; i < data.length; i++) {
      //title
      var title = document.createElement("h1");
      title.innerHTML = data[0].title;
      document.getElementById("resume").appendChild(title);

      //technical skills
      var skills = document.createElement("h2");
      skills.innerHTML = data[0].skills.title;
      document.getElementById("resume").appendChild(skills);

      var skills_list = document.createElement("ul");

      for(var j = 0; j < data[0].skills.skills_list.length; j++){
        var skill = document.createElement("li");
        skill.innerHTML = data[0].skills.skills_list[j];
        skills_list.appendChild(skill);
      }
      document.getElementById("resume").appendChild(skills_list);

      //work experience
      var work_experience = document.createElement("h2");
      work_experience.innerHTML = data[0].work_experience.title;

      document.getElementById("resume").appendChild(work_experience);

      for(var z = 0; z < data[0].work_experience.jobs.length; z++){
        var job_title = document.createElement("h3");
        job_title.innerHTML = data[0].work_experience.jobs[z].title;
        document.getElementById("resume").appendChild(job_title);

        var workplace = document.createElement("h4");
        if(data[0].work_experience.jobs[z].workplace_link){
          var job_link = document.createElement("a");
          job_link.setAttribute("href", data[0].work_experience.jobs[z].workplace_link);
          job_link.innerHTML = data[0].work_experience.jobs[z].workplace;
          workplace.appendChild(job_link);
        }
        else{
          workplace.innerHTML = data[0].work_experience.jobs[z].workplace;
        }
        document.getElementById("resume").appendChild(workplace);

        var duties = document.createElement("p");
        duties.innerHTML = data[0].work_experience.jobs[z].duties;
        document.getElementById("resume").appendChild(duties);

      }

      //education
      var education = document.createElement("h2");
      education.innerHTML = data[0].education.title;
      document.getElementById("resume").appendChild(education);

      var school = document.createElement("h3");
      var school_link = document.createElement("a");
      school_link.setAttribute("href", data[0].education.school_link);
      school_link.innerHTML = data[0].education.school;
      school.appendChild(school_link);
      document.getElementById("resume").appendChild(school);

      var location = document.createElement("p");
      location.innerHTML = data[0].education.location;
      document.getElementById("resume").appendChild(location);

      var degree = document.createElement("p");
      degree.innerHTML = data[0].education.degree;
      document.getElementById("resume").appendChild(degree);

      var graduation = document.createElement("p");
      graduation.innerHTML = data[0].education.graduation;
      document.getElementById("resume").appendChild(graduation);
    }
  }
}

/*
  Dynamically populates the news section of index.html page given data from news.json file.
  Language will be undefined when page is initialized, causing no translation API requests
*/
async function populateNews(data, language){
  //language will be undefined when page is first initialized, function overloaded
  if(typeof language !== "undefined"){
    //clears news
    document.getElementById("news").innerHTML = "";

    var title = document.createElement("h1");
    title.innerHTML = data[0].title;
    await translatePromise(data[0].title, language).then(data => {
      title.innerHTML = data;
    });
    document.getElementById("news").appendChild(title);

    for (var i = 1; i < data.length; i++) {
      var newsDiv = document.createElement("div");
      newsDiv.className = "news-container";
      var newsDivLeft = document.createElement("div");
      newsDivLeft.className = "news-container-left";
      newsDiv.appendChild(newsDivLeft);
      var img = document.createElement("img");
      img.className = "news-image";
      img.setAttribute("src", data[i].image);
      newsDivLeft.appendChild(img);
      var newsDivRight = document.createElement("div");
      newsDivRight.className = "news-container-right";
      newsDiv.appendChild(newsDivRight);
      var heading = document.createElement("h4");
      await translatePromise(data[i].headline, language).then(data => {
        heading.innerHTML = data;
      });

      newsDivRight.appendChild(heading);
      var date = document.createElement("h5");
      date.innerHTML = data[i].date;
      newsDivRight.appendChild(date);
      var text = document.createElement("p");
      await translatePromise(data[i].text, language).then(data => {
        text.innerHTML = data;
      });
      
      newsDivRight.appendChild(text);
      document.getElementById("news").appendChild(newsDiv);
    }
  }
  else{
    var title = document.createElement("h1");
    title.innerHTML = data[0].title;
    document.getElementById("news").appendChild(title);

    for (var i = 1; i < data.length; i++) {
      var newsDiv = document.createElement("div");
      newsDiv.className = "news-container";
      var newsDivLeft = document.createElement("div");
      newsDivLeft.className = "news-container-left";
      newsDiv.appendChild(newsDivLeft);
      var img = document.createElement("img");
      img.className = "news-image";
      img.setAttribute("src", data[i].image);
      newsDivLeft.appendChild(img);
      var newsDivRight = document.createElement("div");
      newsDivRight.className = "news-container-right";
      newsDiv.appendChild(newsDivRight);
      var heading = document.createElement("h4");
      heading.innerHTML = data[i].headline;

      newsDivRight.appendChild(heading);
      var date = document.createElement("h5");
      date.innerHTML = data[i].date;
      newsDivRight.appendChild(date);
      var text = document.createElement("p");
      text.innerHTML = data[i].text;
      
      newsDivRight.appendChild(text);
      document.getElementById("news").appendChild(newsDiv);
    }
  }
}
