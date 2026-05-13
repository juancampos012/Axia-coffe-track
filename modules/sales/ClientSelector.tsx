import { useEffect, useState } from 'react';

import { ClientDAO } from '@/types/Api';
import { getListClients, getListClientsByName } from '@/lib/api-clients';

interface ClientSelectorProps {
  onSelect: (client: ClientDAO) => void;
}

export default function ClientSelector({ onSelect }: ClientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<ClientDAO[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await getListClients();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.length >= 2) {
      try {
        setLoading(true);
        const data = await getListClientsByName(value);
        setClients(data);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching clients:', error);
      } finally {
        setLoading(false);
      }
    } else if (value.length === 0) {
      try {
        const data = await getListClients();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    }
  };

  const handleSelectClient = (client: ClientDAO) => {
    onSelect(client);
    setSearchTerm(`${client.firstName} ${client.lastName}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => { setFocused(true); clients.length > 0 && setShowDropdown(true); }}
        onBlur={() => { setFocused(false); setTimeout(() => setShowDropdown(false), 150); }}
        placeholder="Buscar cliente por nombre"
        className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${focused ? "rgba(74,127,255,0.7)" : "rgba(30,60,139,0.35)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(74,127,255,0.08)" : "none",
        }}
      />

      {loading && (
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "rgba(74,127,255,0.6)" }}
        >
          ...
        </span>
      )}

      {showDropdown && clients.length > 0 && (
        <div
          className="absolute z-10 w-full mt-1 rounded-xl overflow-hidden"
          style={{
            background: "rgba(4,6,18,0.97)",
            border: "1px solid rgba(30,60,139,0.4)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {clients.map((client) => (
            <div
              key={client.id}
              className="px-4 py-2.5 cursor-pointer text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.75)", borderBottom: "1px solid rgba(30,60,139,0.15)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(74,127,255,0.08)"; e.currentTarget.style.color = "white"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
              onClick={() => handleSelectClient(client)}
            >
              <span className="font-bold">{client.firstName} {client.lastName}</span>
              <span className="ml-2 text-[10px] uppercase tracking-widest" style={{ color: "rgba(74,127,255,0.7)" }}>
                {client.identification}
              </span>
            </div>
          ))}
        </div>
      )}

      {showDropdown && clients.length === 0 && !loading && (
        <div
          className="absolute z-10 w-full mt-1 rounded-xl px-4 py-3 text-xs"
          style={{
            background: "rgba(4,6,18,0.97)",
            border: "1px solid rgba(30,60,139,0.4)",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          No se encontraron clientes
        </div>
      )}
    </div>
  );
}
