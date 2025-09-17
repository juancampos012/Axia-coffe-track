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

  // Load initial clients
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

  // Search clients when search term changes
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
      // Reset to initial list when search is cleared
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
        onFocus={() => clients.length > 0 && setShowDropdown(true)}
        placeholder="Buscar cliente por nombre"
        className="w-full p-2 border rounded"
      />
      
      {loading && <div className="absolute right-2 top-2">Cargando...</div>}
      
      {showDropdown && clients.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {clients.map((client) => (
            <div
              key={client.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectClient(client)}
            >
              {client.firstName} {client.lastName} - {client.identification}
            </div>
          ))}
        </div>
      )}
      
      {showDropdown && clients.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg p-2">
          No se encontraron clientes
        </div>
      )}
    </div>
  );
}