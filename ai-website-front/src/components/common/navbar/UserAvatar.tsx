// components/navbar/UserAvatar.tsx
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const UserAvatar = ({ email }: { email: string }) => (
  <Avatar className="border-2 border-white shadow-sm hover:shadow-md transition-all duration-300 hover:border-sky-100 group">
    <AvatarImage
      key={email}
      src={`https://api.dicebear.com/6.x/initials/svg?seed=${email}`}
      alt={email}
      className="group-hover:scale-110 transition-transform duration-500"
    />
    <AvatarFallback className="bg-sky-500 text-white">
      {email?.split("@")[0]?.charAt(0).toUpperCase() || "?"}
    </AvatarFallback>
  </Avatar>
);
