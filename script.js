/**
 * 1. Render songs
 * 2. Scroll top
 * 3. Play / pause / seek
 * 4. CD rotate
 * 5. Next / prev
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active Song
 * 9. Scroll active song into view
 * 10. Play song when click
 */
/// get querySelector
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
//
const PLAYER_STORAGE_KEY = 'player';
// cd be using in handleEvent()
const cd = $('.cd');
// heading-cdThumb-audio be using in loadCurrentSong()
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
// play-pause-seek-cd be using in handleEvent()
const player = $('.player');
const playBtn = $('.btn-toggle-play');
const progress = $('.progress');
// next-prev-random-repeat cd be using
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
// playlist
const playlist = $('.playlist');
const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: 'Sad',
      singer: 'XXXTentacion',
      path: './music/SAD!.mp3',
      image: './img/sad.jpeg',
    },
    {
      name: 'One Dance',
      singer: 'Drake',
      path: './music/OneDance.mp3',
      image: './img/mona.jpeg',
    },
    {
      name: 'Supper Bass',
      singer: 'Nicki Minaj',
      path: './music/SuperBass.mp3',
      image: './img/hug.jpeg',
    },
    {
      name: 'Look at Me!',
      singer: 'XXXTentacion',
      path: './music/LookatMe.mp3',
      image: './img/psycho.jpeg',
    },
    {
      name: 'Day and Night',
      singer: 'Kid Cudi',
      path: './music/DayNight.mp3',
      image: './img/drugtime.jpeg',
    },
    {
      name: 'Humble',
      singer: 'Kendrick Lamar',
      path: './music/humble.mp3',
      image: './img/esc.jpeg',
    },
    {
      name: 'FE!N',
      singer: 'Travis Scott x Playboi Carti',
      path: './music/Fe!n.mp3',
      image: './img/fightclub.jpeg',
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <div class="song ${
          index === this.currentIndex ? 'active' : ''
        }" data-index="${index}">
          <div class="thumb" style="background-image: url('${song.image}')">
          </div>
          <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
          </div>
          <div class="option">
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>`;
    });

    playlist.innerHTML = htmls.join('');
  },
  defineProperties: function () {
    // define properties of this object here is "currentSong"
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  ///------Handle Event------///
  handleEvent: function () {
    const _this = this; // this is a reference of this object here is "app"
    const cdWidth = cd.offsetWidth;
    // process cd when playing rolling animation
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: 'rotate(360deg)',
        },
      ],
      { duration: 10000, iterations: Infinity }
    );
    cdThumbAnimate.pause();
    // process the image to zoom in or out when scrolling
    document.onscroll = function () {
      const scrollTop = document.documentElement.scrollTop || window.scrollY;
      const newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth > 0 ? `${newCdWidth}px` : '0px';
      cd.style.opacity = newCdWidth / cdWidth;
    };
    // process playlist when click
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        // _this.isPlaying = false;
        audio.pause();
        // player.classList.remove('playing');
      } else {
        // _this.isPlaying = true;
        audio.play();
        // player.classList.add('playing');
      }
    };
    //  when song is playing /// advance! we using onplay and onpause trying to use every method of audio
    audio.onplay = function () {
      _this.isPlaying = true;
      player.classList.add('playing');
      cdThumbAnimate.play();
    };
    // when song is paused
    audio.onpause = function () {
      _this.isPlaying = false;
      player.classList.remove('playing');
      cdThumbAnimate.pause();
    };
    // when song timeupdate-seek
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progress.value = percent;
      }
    };
    /// process when seeking audio
    progress.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value; // check current time
      audio.currentTime = seekTime;
    };
    // when next song
    nextBtn.onclick = function () {
      if (_this.randomSong) {
        _this.randomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    // when prev song
    prevBtn.onclick = function () {
      if (_this.randomSong) {
        _this.randomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };
    // when random active song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);
    };
    // when repeat active song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat);
      repeatBtn.classList.toggle('active', _this.isRepeat);
    };
    // when onended song
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };
    // listener when click on song
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)');
      // when click on song
      if (songNode || e.target.closest('.option')) {
        // console.log(e.target);
        // process when click on song title or artist
        if (songNode) {
          // console.log(songNode.getAttribute('data-index')); //  actually can get data-index by dataset.index(form DOM)
          _this.currentIndex = Number(songNode.getAttribute('data-index')); // need to use Number() to convert string to number
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        // process when click on song's option
        if (e.target.closest('.option')) {
        }
      }
    };
  },
  // scroll to active song
  scrollToActiveSong: function () {
    setTimeout(() => {
      const activeSong = $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  },
  // config
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  // show current song
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
    // console.log(heading, cdThumb, audio);
  },
  // nextSong
  nextSong: function () {
    this.currentIndex++;
    this.currentIndex =
      this.currentIndex > this.songs.length - 1 ? 0 : this.currentIndex;
    this.loadCurrentSong();
  },
  // prevSong
  prevSong: function () {
    this.currentIndex--;
    this.currentIndex =
      this.currentIndex < 0 ? this.songs.length - 1 : this.currentIndex;
    this.loadCurrentSong();
  },
  // randomSong
  randomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    } while (newIndex === this.currentIndex);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  start: function () {
    // define properties of this object
    this.defineProperties();
    // listeners of this object (DOM events)
    this.handleEvent();
    // load current song when page load
    this.loadCurrentSong();
    // Render playlist
    this.render();
  },
};
app.start();
