(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TrainersData = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TRAINERS = {
    bugCatcherSammy: {
      id: 'bugCatcherSammy',
      name: 'Bug Catcher Sammy',
      title: 'Novice Trainer',
      location: 'verdantRoute',
      introMessage: 'My bug Pokémon are the sharpest in the whole meadow! Let\'s duel!',
      defeatMessage: 'Aww man, my poor bugs got squashed!',
      rewardCoins: 350,
      rewardItems: [{ itemId: 'pokeBall', count: 3 }],
      team: [
        { speciesId: 'Caterpie', level: 6 },
        { speciesId: 'Butterfree', level: 9 }
      ]
    },
    camperLiam: {
      id: 'camperLiam',
      name: 'Camper Liam',
      title: 'Route Explorer',
      location: 'whisperingWoods',
      introMessage: 'I\'ve been training in these woods for weeks! Watch this!',
      defeatMessage: 'You\'ve got great teamwork with your Pokémon!',
      rewardCoins: 600,
      rewardItems: [{ itemId: 'superPotion', count: 2 }],
      team: [
        { speciesId: 'Pidgeotto', level: 12 },
        { speciesId: 'Pikachu', level: 13 }
      ]
    },
    gymLeaderBrock: {
      id: 'gymLeaderBrock',
      name: 'Gym Leader Brock',
      title: 'Rock Specialist',
      location: 'emberCrag',
      isGymLeader: true,
      badgeReward: 'Boulder Badge',
      introMessage: 'I believe in rock-hard defense and unyielding willpower! Can you break through?!',
      defeatMessage: 'Your determination cracked my defenses! Accept this Boulder Badge!',
      rewardCoins: 1500,
      rewardItems: [{ itemId: 'hyperPotion', count: 2 }],
      team: [
        { speciesId: 'Geodude', level: 15 },
        { speciesId: 'Graveler', level: 18 }
      ]
    },
    gymLeaderMisty: {
      id: 'gymLeaderMisty',
      name: 'Gym Leader Misty',
      title: 'Water Tomboy',
      location: 'ceruleanCoast',
      isGymLeader: true,
      badgeReward: 'Cascade Badge',
      introMessage: 'My sweet water Pokémon can wash away any challenger! Ready to dive in?!',
      defeatMessage: 'You really are an extraordinary trainer! Here is the Cascade Badge!',
      rewardCoins: 2200,
      rewardItems: [{ itemId: 'waterStone', count: 1 }],
      team: [
        { speciesId: 'Squirtle', level: 22 },
        { speciesId: 'Vaporeon', level: 25 },
        { speciesId: 'Lapras', level: 26 }
      ]
    },
    hexManiacSabrina: {
      id: 'hexManiacSabrina',
      name: 'Hex Maniac Sabrina',
      title: 'Crypt Mystic',
      location: 'hauntedCrypt',
      introMessage: 'Fufufu... The shadows whisper of your impending doom...',
      defeatMessage: 'The spirits were wrong... your light dispelled the darkness.',
      rewardCoins: 2800,
      rewardItems: [{ itemId: 'duskBall', count: 3 }],
      team: [
        { speciesId: 'Haunter', level: 30 },
        { speciesId: 'Kadabra', level: 32 },
        { speciesId: 'Gengar', level: 35 }
      ]
    },
    rivalBlue: {
      id: 'rivalBlue',
      name: 'Rival Blue',
      title: 'Elite Rival',
      location: 'indigoSummit',
      introMessage: 'Hey! Did you really think you could challenge the champion before beating me?! Let\'s see!',
      defeatMessage: 'Unbelievable! You\'ve actually become strong...',
      rewardCoins: 4000,
      rewardItems: [{ itemId: 'ultraBall', count: 5 }],
      team: [
        { speciesId: 'Pidgeot', level: 42 },
        { speciesId: 'Alakazam', level: 44 },
        { speciesId: 'Charizard', level: 46 }
      ]
    },
    championLance: {
      id: 'championLance',
      name: 'Champion Lance',
      title: 'Dragon Master & Indigo Champion',
      location: 'indigoSummit',
      isChampion: true,
      badgeReward: 'Champion Trophy',
      introMessage: 'Welcome, challenger. I am Lance, master of dragons! Let our dragons roar!',
      defeatMessage: 'Bravo! You and your Pokémon have reached the ultimate pinnacle of mastery!',
      rewardCoins: 8000,
      rewardItems: [{ itemId: 'masterBall', count: 1 }, { itemId: 'rareCandy', count: 3 }],
      team: [
        { speciesId: 'Draggonor', level: 50 },
        { speciesId: 'Gyarados', level: 52 },
        { speciesId: 'Draggoking', level: 55 }
      ]
    }
  };

  function getTrainer(id) {
    return TRAINERS[id] || null;
  }

  function getTrainersForArea(areaId) {
    return Object.values(TRAINERS).filter(t => t.location === areaId);
  }

  function createTrainerTeam(trainerId, pokemonDataModule) {
    const trainer = getTrainer(trainerId);
    if (!trainer) throw new Error(`Trainer ${trainerId} not found`);

    const dataModule = pokemonDataModule || (typeof root !== 'undefined' ? root.PokemonData : null);
    if (!dataModule) throw new Error('PokemonData module required');

    return trainer.team.map(member => {
      return dataModule.createPokemonInstance(member.speciesId, member.level);
    });
  }

  return {
    TRAINERS,
    getTrainer,
    getTrainersForArea,
    createTrainerTeam
  };
});
