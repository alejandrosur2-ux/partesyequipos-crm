import ClientDeleteButton from './ClientDeleteButton';
import { deleteMachine as deleteMachineAction } from './actions';

// ...
async function remove(id: string) {
  'use server';
  await deleteMachineAction(id);
}

// dentro del listado:
<form action={remove.bind(null, m.id)}>
  <ClientDeleteButton onConfirm={() => { /* no corre en server; el form submit hará la action */ }} />
</form>
