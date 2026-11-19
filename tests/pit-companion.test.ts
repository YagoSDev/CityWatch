import assert from 'node:assert/strict';
import test from 'node:test';
import { clampDockY, pitContext, pitDockBounds } from '../src/features/pit-context.ts';

test('o companheiro acompanha o contexto das rotas sem prometer encaminhamento oficial', () => {
  assert.match(pitContext('/nova-ocorrencia').message, /seguro/);
  assert.match(pitContext('/detalhe-ocorrencia').message, /não significa encaminhamento confirmado/);
  assert.match(pitContext('/mapa').message, /filtros/);
  assert.match(pitContext('/comunidade').message, /favoritos/);
  assert.match(pitContext('/detalhe-evento').message, /demonstrativos/);
  assert.match(pitContext('/perfil').message, /perfil/);
  assert.match(pitContext('/').title, /P.I.T./);
});

test('o arraste permanece entre a safe area e a navegação em iPhones de diferentes tamanhos', () => {
  for (const [width, height, top, bottom] of [[320, 568, 20, 0], [393, 852, 59, 34], [440, 956, 62, 34], [852, 393, 0, 21]]) {
    const bounds = pitDockBounds(width, height, top, bottom);
    assert.ok(bounds.left >= 0);
    assert.ok(bounds.right + 56 <= width);
    assert.ok(bounds.top >= top);
    assert.ok(bounds.bottom + 82 < height - bottom);
    assert.equal(clampDockY(-1000, bounds), bounds.top);
    assert.equal(clampDockY(10000, bounds), bounds.bottom);
    const middle = (bounds.top + bounds.bottom) / 2;
    assert.equal(clampDockY(middle, bounds), middle);
  }
});
