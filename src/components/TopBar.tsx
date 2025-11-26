import React from 'react';
import { useUser } from '../hooks/useUser';
import { usePrivy } from '@privy-io/react-auth';
import { Wallet, ChevronDown } from 'lucide-react';
import '../styles/layout.css';

const TopBar: React.FC = () => {
    const { user } = useUser();
    const { logout } = usePrivy();

    const truncateAddress = (address: string) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="top-bar">
            <div className="top-bar-content">
                <div className="wallet-status">
                    <div className="xp-badge">
                        <span className="xp-label">XP</span>
                        <span className="xp-value">{user?.xp || 0}</span>
                    </div>

                    <button className="wallet-button" onClick={logout}>
                        <Wallet size={18} />
                        <span className="wallet-address">
                            {user?.wallet_address ? truncateAddress(user.wallet_address) : 'Connect Wallet'}
                        </span>
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
