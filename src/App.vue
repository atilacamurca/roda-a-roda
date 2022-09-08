<template>
  <div class="container mx-auto">
    <button type="button" v-on:click="toggleWheel" class="wheel-button">&nbsp;</button>

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
          <div class="wheel__middle"><img src="./assets/logo.png"></div>
        </div>
      </div>
    </div>

    <div class="ml-4 mt-4 bg-teal-400 pt-2 font-semibold text-5xl border-8 border-[#489fb4]">
      <span v-for="(word, index) in phrase" :key="word + '' + index">
        <!-- <span class="board__letter board__letter--space" v-if="index !== 0">&nbsp;</span> -->
        <br v-if="index !== 0" />
        <span class="board__word inline-flex flex-wrap">
          <span v-for="(item, index2) in word" :key="item + '' + index2" class="board__letter border-2 border-slate-800"
            :hidden="!item.visible">{{ item.char }}</span>
        </span>
      </span>
    </div>

    <div class="clue container mx-auto mt-2">{{ clue }}</div>
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
          <div class="my-3">
            <div class="flex justify-center">
              <div class="mb-3 xl:w-96">
                <input v-model="resposta" type="text" class="form-control
        block
        w-full
        px-3
        py-1.5
        text-base
        font-normal
        text-gray-700
        bg-white bg-clip-padding
        border border-solid border-gray-300
        rounded
        transition
        ease-in-out
        m-0
        focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" placeholder="Resposta" />
              </div>
              <div>
                <button type="button" class="inline-block px-6 py-2 ml-2 border-2 border-blue-600
                 text-blue-600 font-medium text-xs leading-tight uppercase rounded
                 hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0
                 transition duration-150 ease-in-out" @click.prevent="guessPhrase">Responder</button>
              </div>
            </div>
            <transition name="bounce">
              <div v-show="rightAnswer" class="mx-auto w-3/4 bg-green-100 rounded-lg py-5 px-6 mb-4
                 text-center text-2xl text-green-700 mb-3" role="alert">
                Parabéns! Você acertou.
              </div>
            </transition>
            <transition name="bounce">
              <div v-show="wrongAnswer" class="mx-auto w-3/4 bg-red-100 rounded-lg py-5 px-6 mb-4
                text-center text-2xl text-red-700 mb-3" role="alert">
                Que pena, você errou.
              </div>
            </transition>

            <div class="flex justify-between">
              <div>
                Questão {{ currentPhrase + 1 }} de {{ totalQuestions }}
              </div>
              <div>
                <button type="button" @click.prevent="goFullscreen"
                 class="inline-block px-6 py-2 border-2 border-gray-800 text-gray-800
                 font-medium text-xs leading-tight uppercase rounded hover:bg-black
                 hover:bg-opacity-5 focus:outline-none focus:ring-0 transition
                 duration-150 ease-in-out">Tela cheia</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import questions from './assets/questions.json';
import accents from 'remove-accents';
import screenfull from 'screenfull';

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
      wheelSegments: ['S', 5, 1, 2, 4, 1, 3, 2, 1, 3, 1, 2, 5, 3, 1, 2, 6, 2, 4, 6, 'B', 3, 2, 1],
      resposta: '',
      rightAnswer: false,
      wrongAnswer: false
    }
  },
  storage: {
    keys: ['players', 'currentPlayer', 'currentScore', 'currentPhrase', 'clue', 'phrase', 'alphabetUsed'],
    namespace: 'roda-a-roda'
  },
  mounted() {
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
          letter.visible = this.alphabetUsed[letter.char] || letter.char === '-';
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
          char = char.toUpperCase();
          let visible = char.match(/[A-Z]/) === null;
          letterArray.push({
            char,
            visible
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
      this.resposta = '';
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
    },
    guessPhrase() {
      const answer = accents.remove(this.resposta).toUpperCase();
      if (answer === questions[this.currentPhrase].phrase.toUpperCase()) {
        this.rightAnswer = true;
        this.showBoard();
        setTimeout(() => {
          this.rightAnswer = false;
        }, 2000);
      } else {
        this.resposta = '';
        this.wrongAnswer = true;
        this.setNextPlayer();
        setTimeout(() => {
          this.wrongAnswer = false;
        }, 2000);
      }
    },
    goFullscreen() {
      console.log('screenfull.enabled:', screenfull.isEnabled)
      if (screenfull.isEnabled) {
        screenfull.request();
        window.screen.orientation.lock('landscape');
      }
    }
  },
  computed: {
    totalQuestions() {
      return questions.length;
    }
  }
}
</script>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0);
  }

  50% {
    transform: scale(1.25);
  }

  100% {
    transform: scale(1);
  }
}
</style>
