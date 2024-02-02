function getCarts() {
	return [
		{
			title: "YOOO",
			tooltip: "Me when kick ball",
			audiofile: "yooooooooooo.mp3",
			room: YELLOW_ROOM
		},
		{
			title: "🗿",
			tooltip: "🗿",
			audiofile: "OOOOOAAAAAAAUUUUU.mp3",
			room: ORANGE_ROOM
		},
		{
			title: "Huh?",
			tooltip: "I dunno",
			audiofile: "Huh.mp3",
			room: BOTH,
			isEnd: true
		}
	];
}

function getHintergrundSounds() {
	return [
		{
			room: "yellow",
			audiofile: `${HINTERGRUND_PATH}Aria Math.mp3`,
		},
		{
			room: "orange",
			audiofile: `${HINTERGRUND_PATH}Skyrim Theme.mp3`
		}
	];
}

const YELLOW_ROOM = -1;
const BOTH = 0;
const ORANGE_ROOM = 1;

const HINT_PATH = '.\\audio\\hinweise\\';
const HINTERGRUND_PATH = '.\\audio\\hintergrundsound\\';

const hintergrundSounds = [];
const helpSounds = [];

function addCart({title, tooltip, audiofile, room=ORANGE_ROOM, isEnd=false}) {
	const cart = document.createElement('div');
	cart.classList.add('cart');

	if (isEnd) {
		cart.classList.add('red');
	} else {
		if (room === ORANGE_ROOM) {
			cart.classList.add('orange');
		} else if (room === YELLOW_ROOM) {
			cart.classList.add('yellow');
		}
	}

	const cartTitle = document.createElement('h4');
	cartTitle.classList.add("cart-title");
	cartTitle.innerHTML = title;

	const cartTooltip = document.createElement('span');
	cartTooltip.classList.add("cart-help");
	cartTooltip.innerHTML = tooltip;

	cart.append(cartTitle, getCartAudioButton(audiofile, room), cartTooltip);

	document.querySelector('.carts').append(cart);
}

function getCartAudioButton(hintName, room) {
	let snd  = new Audio();
	let src  = document.createElement('source');
	src.type = 'audio/mpeg';
	src.src  = HINT_PATH + hintName;
	snd.appendChild(src);

	const audioCtx = new AudioContext();
	const panNode = audioCtx.createStereoPanner();

	const source = audioCtx.createMediaElementSource(snd);
	source.connect(panNode);
	panNode.connect(audioCtx.destination);

	panNode.pan.setValueAtTime(room, audioCtx.currentTime);

	const playButton = document.createElement('button');
	playButton.classList.add("cart-button");
	playButton.textContent = "Play";
	playButton.onclick = () => {
		snd.play();
		snd.onended = () => {
			snd.currentTime = 0;
		}
	}

	helpSounds.push(snd);

	return playButton;
}

function setupRooms() {
	const music = getHintergrundSounds();

	music.forEach(({room, audiofile}) => {
		const roomEl = document.querySelector(`#${room}-room`);
		var bgAudio  = new Audio();
		hintergrundSounds.push(bgAudio);
		var src  = document.createElement('source');
		src.type = 'audio/mpeg';
		src.src  = audiofile;
		bgAudio.appendChild(src);
	
		const audioCtx = new AudioContext();
		const panNode = audioCtx.createStereoPanner();
	
		const source = audioCtx.createMediaElementSource(bgAudio);
		source.connect(panNode);
		panNode.connect(audioCtx.destination);
	
		panNode.pan.setValueAtTime(room === 'yellow' ? YELLOW_ROOM : ORANGE_ROOM, audioCtx.currentTime);
	
		const play = document.createElement('button');
		const pause = document.createElement('button');
		const stop = document.createElement('button');
	
		play.innerHTML = "Play";
		play.onclick = () => {
			bgAudio.play();
			bgAudio.onended = () => {
				bgAudio.currentTime = 0;
				bgAudio.play();
			}
		}
	
		pause.innerHTML = "Pause";
		pause.onclick = () => {
			bgAudio.pause();
		};
	
		stop.innerHTML = "Stop";
		stop.onclick = () => {
			bgAudio.pause();
			bgAudio.currentTime = 0;
		}

		const buttonWrapper = document.createElement('div');
		buttonWrapper.append(play, pause, stop);
		roomEl.append(buttonWrapper);
	});
}

function setup() {
	const hintergrundVolume = document.querySelector('#hintergrund-volume');
	hintergrundVolume.oninput = () => {
		hintergrundSounds.forEach((sound) => {
			sound.volume = hintergrundVolume.value/100;
		});
	}

	const helpVolume = document.querySelector('#help-volume');
	helpVolume.oninput = () => {
		helpSounds.forEach((sound) => {
			sound.volume = helpVolume.value/100;
		});
	}

	getCarts().forEach((cart) => {
		addCart(cart);
	});

	setupRooms();
}

setup();