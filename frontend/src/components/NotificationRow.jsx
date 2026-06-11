import { avatarUrl } from '../utils/helpers.js';

export default function NotificationRow({ notification }) {
  const { tipo, ator, texto, data_criacao, lida } = notification;
  return (
    <div className="bg-bg-surface border-b border-border-subtle px-4 py-3 flex items-center">
      <div className="avatar-gradient mr-3">
        <img src={avatarUrl(ator)} alt={ator.username} className="w-10 h-10 rounded-full" />
      </div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-bold">@{ator.username}</span> {texto}
        </p>
        <p className="text-xs text-text-muted mt-1">{new Date(data_criacao).toLocaleString()}</p>
      </div>
      {!lida && <span className="w-2 h-2 bg-accent rounded-full ml-2" />}
    </div>
  );
}
