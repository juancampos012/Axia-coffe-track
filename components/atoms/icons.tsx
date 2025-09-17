
import { FaUser } from "react-icons/fa"; 
import { BsLock } from "react-icons/bs"; 
import { FaApple } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { AiOutlineLogin } from "react-icons/ai";
import { FiMail } from "react-icons/fi"; 

export const LoginIcon: React.FC<{ color: string }> = ({ color }) => (
	<AiOutlineLogin size={24} color={color} />
);

export const UserIcon: React.FC<{ color: string }> = ({ color }) => (
	<FaUser size={20} color={color} />
);

export const EmailIcon: React.FC<{ color: string }> = ({ color }) => (
	<FiMail size={20} color={color} />
);

export const PasswordIcon: React.FC<{ color: string }> = ({ color }) => (
	<BsLock size={20} color={color} />
);

export const AppleIcon = () => <FaApple size={25} color="white" />;

export const GoogleIcon = () => <FaGoogle size={25} color="white" />;

