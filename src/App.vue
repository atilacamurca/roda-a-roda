<template>
  <div>
    <button type="button" v-on:click="toggleWheel" class="wheel-button">Wheel</button>

    <div class="wheel-popover" v-if="showWheel">
      <button class="wheel-popover__button" type="button" @click="spinWheel('cw')">RODA!</button>
      <div class="wheel">
        <div class="wheel__spinner" v-bind:style="'transform: rotate(' + wheelSpinDegs + 'deg);'">
          <div v-for="(seg, index) in wheelSegments" :key="seg + '' + index" class="wheel__segment"
            @click="definePts(seg)">
            <span><template v-if="seg === 'S'">Pula</template>
              <template v-else-if="seg === 'B'">Perde</template>
              <template v-else>{{ seg }}pt</template></span>
          </div>
          <div class="wheel__middle"><img src="logo.png"></div>
        </div>
      </div>
    </div>

    <div class="board">
      <span v-for="(word, index) in phrase" :key="word + '' + index">
        <span class="board__letter board__letter--space" v-if="index !== 0">&nbsp;</span>
        <span class="board__word">
          <span v-for="(item, index2) in word" :key="item + '' + index2" class="board__letter"
            :hidden="!item.visible">{{ item.char }}</span>
        </span>
      </span>
    </div>

    <div class="clue">{{ clue }}</div>
    <div class="text-white text-center font-bold text-3xl mt-2">Valendo {{ currentScore }}pts</div>

    <div class="controls">
      <div class="controls__grid">
        <button class="controls__button" type="button" v-for="(used, letter) in alphabetUsed" :key="letter"
          v-bind:disabled="used" v-on:click="activateLetter(letter)">{{ letter }}</button>
      </div>
      <div class="flex flex-wrap">
        <button class="controls__button controls__button--solve p-2" type="button"
          v-on:click="showBoard">Revelar</button>
        <button class="controls__button controls__button--solve p-2" @click.prevent="previousQuestion">&lt;</button>
        <button class="controls__button controls__button--solve p-2" @click.prevent="nextQuestion">&gt;</button>
        <button class="controls__button controls__button--solve p-2" @click.prevent="reset">Reset</button>
      </div>
    </div>

    <div class="players">
      <section class="text-gray-600 body-font my-5">
        <div class="container px-5 py-2 mx-auto bg-white rounded">
          <div class="flex flex-wrap -m-4 text-center justify-center">
            <div v-for="player in players" :key="player.id" class="p-4 md:w-1/4 sm:w-1/2 w-full">
              <div class="border-2 border-gray-200 px-4 py-6 rounded-lg"
                :class="[player.id === currentPlayer ? 'border-yellow-500' : '']"
                @click.prevent="currentPlayer = player.id">
                <h2 class="title-font font-medium text-3xl text-gray-900">{{ player.score }} pts</h2>
                <p class="leading-relaxed">{{ player.name }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>


const questions = [
  { clue: "Phrase/Quotation", phrase: "I just don't know what went wrong" },
  { clue: "On The Map", phrase: "Neighagra Falls" },
  { clue: "Husband & Wife", phrase: "Twilight Velvet & Night Light" },
  { clue: "Person", phrase: "Sea Serpent Steven Magnet" },
  { clue: "What are you doing?", phrase: "Being twenty percent cooler" },
  { clue: "Animais", phrase: 'abelha barracuda camundongo' }
];

const initialState = () => ({
  players: [
    {
      id: 0,
      name: 'Jogador 1',
      score: 0
    },
    {
      id: 1,
      name: 'Jogador 2',
      score: 0
    },
    {
      id: 2,
      name: 'Jogador 3',
      score: 0
    }
  ],
  currentPlayer: 0,
  currentScore: 0,
  currentPhrase: null,
  clue: '',
  phrase: [],
  alphabetUsed: {
    A: false,
    B: false,
    C: false,
    D: false,
    E: false,
    F: false,
    G: false,
    H: false,
    I: false,
    J: false,
    K: false,
    L: false,
    M: false,
    N: false,
    O: false,
    P: false,
    Q: false,
    R: false,
    S: false,
    T: false,
    U: false,
    V: false,
    W: false,
    X: false,
    Y: false,
    Z: false
  }
})

export default {
  data() {
    return {
      ...initialState(),
      showWheel: false,
      wheelSpinDegs: 0,
      wheelSpinDuration: 0,
      wheelSegments: ['S', 5, 1, 2, 4, 1, 3, 2, 1, 3, 1, 2, 5, 3, 1, 2, 6, 2, 4, 6, 'B', 3, 2, 1]
    }
  },
  storage: {
    keys: ['players', 'currentPlayer', 'currentScore', 'currentPhrase', 'clue', 'phrase', 'alphabetUsed'],
    namespace: 'roda-a-roda'
  },
  mounted() {
    // let item;
    // const urlParams = new URL(document.location.href).searchParams;
    // if (urlParams.get('q')) {
    //   item = questions[urlParams.get('q')];
    // } else {
    //   item = questions[Math.floor(Math.random() * questions.length)];
    // }
    // this.phrase = this.parsePhrase(item.phrase);
    // this.clue = item.clue;
    if (this.currentPhrase === null) {
      this.currentPhrase = 0;
    }
    this.defineQuestion();
  },
  methods: {
    defineQuestion() {
      this.phrase = this.parsePhrase(questions[this.currentPhrase].phrase);
      this.clue = questions[this.currentPhrase].clue;
      // recuperar letras já reveladas
      this.phrase.forEach((word) => {
        word.forEach((letter) => {
            letter.visible = this.alphabetUsed[letter.char];
        });
      });
    },
    toggleWheel: function () {
      this.showWheel = !this.showWheel;
    },
    parsePhrase: function (phrase) {
      const words = phrase.split(' ');
      const wordArray = [];
      words.forEach((word) => {
        const characters = word.split('');
        const letterArray = [];
        characters.forEach((char) => {
          let visible = true;
          char = char.toUpperCase();
          if (char.match(/[A-Z]/)) {
            visible = false;
          }
          letterArray.push({
            char: char,
            visible: visible
          });
        });
        wordArray.push(letterArray);
      });
      return wordArray;
    },
    activateLetter: function (activatedLetter) {
      let exists = 0;
      this.phrase.forEach((word) => {
        word.forEach((letter) => {
          if (letter.char === activatedLetter) {
            letter.visible = true;
            this.players[this.currentPlayer].score += this.currentScore;
            exists++;
          }
        });
      });
      this.alphabetUsed[activatedLetter] = true;
      if (exists === 0) {
        this.setNextPlayer();
      }
    },
    showBoard: function () {
      this.phrase.forEach((word) => {
        word.forEach((letter) => {
          letter.visible = true;
        });
      });
    },
    spinWheel: function (dir = 'cw') {
      const min = 365;
      const max = 1825;
      let randomQuantity = Math.floor(Math.random() * (max - min + 1) + min);
      if (dir === 'ccw') {
        randomQuantity = 0 - randomQuantity;
      }
      this.wheelSpinDegs += randomQuantity;
      this.wheelSpinDuration = 0.5;
    },
    definePts(seg) {
      if (seg === 'S') {
        this.setNextPlayer()
      } else if (seg === 'B') {
        this.players[this.currentPlayer].score = 0;
        this.setNextPlayer()
      } else {
        this.currentScore = seg;
      }
      this.showWheel = false;
    },
    setNextPlayer() {
      if (this.currentPlayer === this.players.length - 1) {
        this.currentPlayer = 0;
      } else {
        this.currentPlayer++;
      }
    },
    reset() {
      const state = initialState();
      this.players = state.players;
      this.currentPlayer = state.currentPlayer;
      this.currentScore = state.currentScore;
      this.alphabetUsed = state.alphabetUsed;
      this.defineQuestion();
    },
    previousQuestion() {
      this.currentPhrase--;
      if (this.currentPhrase < 0) {
        this.currentPhrase = questions.length - 1;
      }
      this.reset();
    },
    nextQuestion() {
      this.currentPhrase++;
      const len = questions.length;
      if (this.currentPhrase > len - 1) {
        this.currentPhrase = 0;
      }
      this.reset();
    }
  }
}
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
