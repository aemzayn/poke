import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [pokemon, setPokemon] = useState({ results: [] });
  const endpoint = 'https://pokeapi.co/api/v2/pokemon';

  useEffect(() => {
    getPokemon(endpoint).then(() => {});
  }, []);

  const getPokemon = async (endpoint) => {
    axios.get(endpoint).then((response) => {
      const config = {
        next: response.data?.next,
        previous: response.data?.previous,
      };
      Promise.all(
        response.data.results.map((p) => {
          return axios.get(p.url).then((res) => res.data);
        })
      ).then((pokemonData) => {
        config.results = pokemonData;
        setPokemon(config);
      });
    });
  };

  const goBack = async () => {
    if (!pokemon?.previous) return;
    await getPokemon(pokemon.previous);
  };

  const goNext = async () => {
    if (!pokemon?.next) return;
    await getPokemon(pokemon.next);
  };

  return (
    <div className="container">
      <h1>pokemon</h1>
      <div className="pokemon-list">
        {pokemon.results.map((poke) => (
          <Pokemon poke={poke} key={poke.id} />
        ))}
      </div>
      <div className="buttons">
        <button onClick={goBack} disabled={!pokemon?.previous}>
          Previous
        </button>
        <button onClick={goNext} disabled={!pokemon?.next}>
          Next
        </button>
      </div>
    </div>
  );
}

const Pokemon = ({ poke }) => {
  const [spriteSrc, setSpriteSrc] = useState(poke?.sprites?.front_default);
  const sprites = useMemo(() => {
    return Object.values(poke.sprites).filter(
      (a) => a && typeof a === 'string'
    );
  }, [poke.name]);

  const handleImageClick = () => {
    const curr = sprites.indexOf(spriteSrc);
    setSpriteSrc(curr + 1 >= sprites.length ? sprites[0] : sprites[curr + 1]);
  };

  return (
    <div className="pokemon-item" key={poke.name}>
      <img
        onClick={handleImageClick}
        className="sprite"
        src={spriteSrc}
        alt={poke.name}
      />
      <span>{poke.name}</span>
    </div>
  );
};

export default App;
