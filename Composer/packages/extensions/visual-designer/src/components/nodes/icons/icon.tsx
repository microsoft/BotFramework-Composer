import React from 'react';

const FriendSVG = fill => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9.58594 4.06055C9.83984 4.18945 10.0684 4.34961 10.2715 4.54102C10.4785 4.72852 10.6543 4.93945 10.7988 5.17383C10.9434 5.4043 11.0547 5.6543 11.1328 5.92383C11.2109 6.18945 11.25 6.46484 11.25 6.75H10.5C10.5 6.44141 10.4395 6.15039 10.3184 5.87695C10.2012 5.60352 10.041 5.36523 9.83789 5.16211C9.63477 4.95898 9.39648 4.79883 9.12305 4.68164C8.84961 4.56055 8.55859 4.5 8.25 4.5C7.94141 4.5 7.65039 4.56055 7.37695 4.68164C7.10352 4.79883 6.86523 4.95898 6.66211 5.16211C6.45898 5.36523 6.29688 5.60352 6.17578 5.87695C6.05859 6.15039 6 6.44141 6 6.75C6 7.10547 5.91797 7.44336 5.75391 7.76367C5.59375 8.08398 5.37109 8.34961 5.08594 8.56055C5.33984 8.68945 5.56836 8.84961 5.77148 9.04102C5.97852 9.22852 6.1543 9.43945 6.29883 9.67383C6.44336 9.9043 6.55469 10.1543 6.63281 10.4238C6.71094 10.6895 6.75 10.9648 6.75 11.25H6C6 10.9414 5.93945 10.6504 5.81836 10.377C5.70117 10.1035 5.54102 9.86523 5.33789 9.66211C5.13477 9.45898 4.89648 9.29883 4.62305 9.18164C4.34961 9.06055 4.05859 9 3.75 9C3.44141 9 3.15039 9.06055 2.87695 9.18164C2.60352 9.29883 2.36523 9.45898 2.16211 9.66211C1.95898 9.86523 1.79688 10.1035 1.67578 10.377C1.55859 10.6504 1.5 10.9414 1.5 11.25H0.75C0.75 10.9648 0.789062 10.6895 0.867188 10.4238C0.945312 10.1543 1.05664 9.9043 1.20117 9.67383C1.3457 9.43945 1.51953 9.22852 1.72266 9.04102C1.92969 8.84961 2.16016 8.68945 2.41406 8.56055C2.12891 8.34961 1.9043 8.08398 1.74023 7.76367C1.58008 7.44336 1.5 7.10547 1.5 6.75C1.5 6.44141 1.55859 6.15039 1.67578 5.87695C1.79688 5.60352 1.95898 5.36523 2.16211 5.16211C2.36523 4.95898 2.60352 4.79883 2.87695 4.68164C3.15039 4.56055 3.44141 4.5 3.75 4.5C4.10547 4.5 4.44336 4.58203 4.76367 4.74609C5.08398 4.90625 5.34961 5.12891 5.56055 5.41406C5.70898 5.12109 5.89844 4.85938 6.12891 4.62891C6.35938 4.39844 6.62109 4.20898 6.91406 4.06055C6.62891 3.84961 6.4043 3.58398 6.24023 3.26367C6.08008 2.94336 6 2.60547 6 2.25C6 1.94141 6.05859 1.65039 6.17578 1.37695C6.29688 1.10352 6.45898 0.865234 6.66211 0.662109C6.86523 0.458984 7.10352 0.298828 7.37695 0.181641C7.65039 0.0605469 7.94141 0 8.25 0C8.55859 0 8.84961 0.0605469 9.12305 0.181641C9.39648 0.298828 9.63477 0.458984 9.83789 0.662109C10.041 0.865234 10.2012 1.10352 10.3184 1.37695C10.4395 1.65039 10.5 1.94141 10.5 2.25C10.5 2.60547 10.418 2.94336 10.2539 3.26367C10.0938 3.58398 9.87109 3.84961 9.58594 4.06055ZM3.75 8.25C3.95312 8.25 4.14648 8.21094 4.33008 8.13281C4.51367 8.05078 4.67188 7.94336 4.80469 7.81055C4.94141 7.67383 5.04883 7.51562 5.12695 7.33594C5.20898 7.15234 5.25 6.95703 5.25 6.75C5.25 6.54688 5.20898 6.35352 5.12695 6.16992C5.04883 5.98633 4.94141 5.82812 4.80469 5.69531C4.67188 5.55859 4.51367 5.45117 4.33008 5.37305C4.14648 5.29102 3.95312 5.25 3.75 5.25C3.54297 5.25 3.34766 5.29102 3.16406 5.37305C2.98438 5.45117 2.82617 5.55859 2.68945 5.69531C2.55664 5.82812 2.44922 5.98633 2.36719 6.16992C2.28906 6.35352 2.25 6.54688 2.25 6.75C2.25 6.95703 2.28906 7.15234 2.36719 7.33594C2.44922 7.51562 2.55664 7.67383 2.68945 7.81055C2.82617 7.94336 2.98438 8.05078 3.16406 8.13281C3.34766 8.21094 3.54297 8.25 3.75 8.25ZM6.75 2.25C6.75 2.45703 6.78906 2.65234 6.86719 2.83594C6.94922 3.01563 7.05664 3.17383 7.18945 3.31055C7.32617 3.44336 7.48438 3.55078 7.66406 3.63281C7.84766 3.71094 8.04297 3.75 8.25 3.75C8.45312 3.75 8.64648 3.71094 8.83008 3.63281C9.01367 3.55078 9.17188 3.44336 9.30469 3.31055C9.44141 3.17383 9.54883 3.01563 9.62695 2.83594C9.70898 2.65234 9.75 2.45703 9.75 2.25C9.75 2.04687 9.70898 1.85352 9.62695 1.66992C9.54883 1.48633 9.44141 1.32813 9.30469 1.19531C9.17188 1.05859 9.01367 0.951172 8.83008 0.873047C8.64648 0.791016 8.45312 0.75 8.25 0.75C8.04297 0.75 7.84766 0.791016 7.66406 0.873047C7.48438 0.951172 7.32617 1.05859 7.18945 1.19531C7.05664 1.32813 6.94922 1.48633 6.86719 1.66992C6.78906 1.85352 6.75 2.04687 6.75 2.25Z"
        fill={fill}
      />
    </svg>
  );
};

const UserSVG = fill => {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.75504 5.0572C6.13475 5.18843 6.47677 5.3727 6.7811 5.61002C7.08822 5.84455 7.34788 6.11677 7.56007 6.42668C7.77505 6.73659 7.93978 7.07582 8.05425 7.44436C8.16872 7.8129 8.22596 8.1968 8.22596 8.59606H7.6899C7.6899 8.13817 7.60753 7.71379 7.4428 7.32291C7.28087 6.92924 7.05611 6.58861 6.76854 6.30104C6.48096 6.01346 6.14034 5.78871 5.74667 5.62677C5.35579 5.46204 4.9314 5.37968 4.47351 5.37968C4.17477 5.37968 3.88719 5.41737 3.61079 5.49275C3.33438 5.56814 3.07612 5.67563 2.83601 5.81523C2.59869 5.95204 2.38231 6.11816 2.18687 6.3136C1.99422 6.50625 1.8281 6.72263 1.6885 6.96274C1.55169 7.20006 1.44559 7.45692 1.37021 7.73333C1.29482 8.00974 1.25713 8.29732 1.25713 8.59606H0.721069C0.721069 8.19401 0.779701 7.81011 0.896965 7.44436C1.01423 7.07582 1.18035 6.73799 1.39534 6.43087C1.61032 6.12375 1.86998 5.85292 2.1743 5.61839C2.48142 5.38387 2.82344 5.1982 3.20036 5.06139C2.98259 4.94413 2.78715 4.80173 2.61404 4.63422C2.44094 4.4667 2.29296 4.28103 2.17012 4.07721C2.05006 3.8706 1.95653 3.65143 1.88952 3.4197C1.8253 3.18517 1.7932 2.94506 1.7932 2.69936C1.7932 2.32803 1.863 1.98042 2.0026 1.65655C2.1422 1.32989 2.33345 1.0451 2.57635 0.802198C2.81926 0.559295 3.10264 0.368043 3.42651 0.228443C3.75318 0.0888429 4.10218 0.019043 4.47351 0.019043C4.84485 0.019043 5.19245 0.0888429 5.51632 0.228443C5.84299 0.368043 6.12777 0.559295 6.37068 0.802198C6.61358 1.0451 6.80483 1.32989 6.94443 1.65655C7.08403 1.98042 7.15383 2.32803 7.15383 2.69936C7.15383 2.94506 7.12033 3.18377 7.05332 3.41551C6.9891 3.64724 6.89557 3.86502 6.77272 4.06884C6.65267 4.27265 6.50609 4.45972 6.33298 4.63003C6.16267 4.79755 5.97002 4.93994 5.75504 5.0572ZM2.32926 2.69936C2.32926 2.99531 2.3851 3.27312 2.49678 3.53277C2.61125 3.79243 2.76481 4.01998 2.95746 4.21542C3.1529 4.40806 3.38045 4.56162 3.6401 4.6761C3.89976 4.78778 4.17756 4.84362 4.47351 4.84362C4.76947 4.84362 5.04727 4.78778 5.30693 4.6761C5.56658 4.56162 5.79273 4.40806 5.98538 4.21542C6.18082 4.01998 6.33438 3.79243 6.44606 3.53277C6.56053 3.27312 6.61777 2.99531 6.61777 2.69936C6.61777 2.40341 6.56053 2.12561 6.44606 1.86595C6.33438 1.60629 6.18082 1.38014 5.98538 1.18749C5.79273 0.992054 5.56658 0.838494 5.30693 0.726814C5.04727 0.612342 4.76947 0.555107 4.47351 0.555107C4.17756 0.555107 3.89976 0.612342 3.6401 0.726814C3.38045 0.838494 3.1529 0.992054 2.95746 1.18749C2.76481 1.38014 2.61125 1.60629 2.49678 1.86595C2.3851 2.12561 2.32926 2.40341 2.32926 2.69936Z"
        fill={fill}
      />
    </svg>
  );
};

const MessageBotSVG = fill => {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.84652 5.82991H3.07729V5.05259H3.84652V5.82991ZM6.92344 5.82991H6.15421V5.05259H6.92344V5.82991ZM10.0004 5.05259V6.60724H9.23114V8.55056C9.23114 8.71251 9.20109 8.86433 9.14099 9.00603C9.0809 9.14773 8.99876 9.27121 8.8946 9.37647C8.79043 9.48174 8.66823 9.56473 8.52801 9.62546C8.38779 9.68619 8.23755 9.71655 8.07729 9.71655H6.49075L3.84652 12V9.71655H1.92344C1.76319 9.71655 1.61295 9.68619 1.47272 9.62546C1.3325 9.56473 1.2103 9.48174 1.10614 9.37647C1.00197 9.27121 0.919837 9.14773 0.859741 9.00603C0.799645 8.86433 0.769597 8.71251 0.769597 8.55056V6.60724H0.000366211V5.05259H0.769597V3.88659C0.769597 3.72465 0.799645 3.57283 0.859741 3.43113C0.919837 3.28943 1.00197 3.16595 1.10614 3.06068C1.2103 2.95542 1.3325 2.87242 1.47272 2.8117C1.61295 2.75097 1.76319 2.7206 1.92344 2.7206H4.61575V1.45137C4.49957 1.38255 4.40541 1.2874 4.3333 1.16595C4.26519 1.04449 4.23114 0.914934 4.23114 0.777282C4.23114 0.66797 4.25117 0.566756 4.29123 0.473638C4.3313 0.380521 4.38538 0.299549 4.45349 0.230723C4.52561 0.157849 4.60774 0.101169 4.69989 0.060683C4.79203 0.0201971 4.89219 -4.57764e-05 5.00037 -4.57764e-05C5.10854 -4.57764e-05 5.2087 0.0201971 5.30085 0.060683C5.39299 0.101169 5.47312 0.157849 5.54123 0.230723C5.61335 0.299549 5.66944 0.380521 5.7095 0.473638C5.74957 0.566756 5.7696 0.66797 5.7696 0.777282C5.7696 0.914934 5.73354 1.04449 5.66142 1.16595C5.59332 1.2874 5.50117 1.38255 5.38498 1.45137V2.7206H8.07729C8.23755 2.7206 8.38779 2.75097 8.52801 2.8117C8.66823 2.87242 8.79043 2.95542 8.8946 3.06068C8.99876 3.16595 9.0809 3.28943 9.14099 3.43113C9.20109 3.57283 9.23114 3.72465 9.23114 3.88659V5.05259H10.0004ZM8.4619 3.88659C8.4619 3.78133 8.42384 3.69024 8.34772 3.61331C8.2716 3.53639 8.18146 3.49793 8.07729 3.49793H1.92344C1.81928 3.49793 1.72913 3.53639 1.65301 3.61331C1.57689 3.69024 1.53883 3.78133 1.53883 3.88659V8.55056C1.53883 8.65582 1.57689 8.74692 1.65301 8.82384C1.72913 8.90076 1.81928 8.93923 1.92344 8.93923H4.61575V10.3117L6.20229 8.93923H8.07729C8.18146 8.93923 8.2716 8.90076 8.34772 8.82384C8.42384 8.74692 8.4619 8.65582 8.4619 8.55056V3.88659ZM3.34772 6.69226C3.56807 6.91493 3.82048 7.087 4.10493 7.20846C4.38939 7.32587 4.68787 7.38457 5.00037 7.38457C5.31287 7.38457 5.61134 7.32587 5.8958 7.20846C6.18025 7.087 6.43266 6.91493 6.65301 6.69226L7.19388 7.24489C6.90141 7.54044 6.56487 7.76716 6.18426 7.92506C5.80766 8.08295 5.41303 8.1619 5.00037 8.1619C4.58771 8.1619 4.19107 8.08295 3.81046 7.92506C3.43386 7.76716 3.09932 7.54044 2.80686 7.24489L3.34772 6.69226Z"
        fill={fill}
      />
    </svg>
  );
};

const StopSVG = fill => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 0C7.64258 0 8.26237 0.0843099 8.85938 0.25293C9.45638 0.416992 10.0124 0.651693 10.5273 0.957031C11.0469 1.26237 11.5186 1.62923 11.9424 2.05762C12.3708 2.48145 12.7376 2.95312 13.043 3.47266C13.3483 3.98763 13.583 4.54362 13.7471 5.14062C13.9157 5.73763 14 6.35742 14 7C14 7.64258 13.9157 8.26237 13.7471 8.85938C13.583 9.45638 13.3483 10.0146 13.043 10.5342C12.7376 11.0492 12.3708 11.5208 11.9424 11.9492C11.5186 12.373 11.0469 12.7376 10.5273 13.043C10.0124 13.3483 9.45638 13.5853 8.85938 13.7539C8.26237 13.918 7.64258 14 7 14C6.35742 14 5.73763 13.918 5.14062 13.7539C4.54362 13.5853 3.98535 13.3483 3.46582 13.043C2.95085 12.7376 2.47917 12.373 2.05078 11.9492C1.62695 11.5208 1.26237 11.0492 0.957031 10.5342C0.651693 10.0146 0.414714 9.45638 0.246094 8.85938C0.0820312 8.26237 0 7.64258 0 7C0 6.35742 0.0820312 5.73763 0.246094 5.14062C0.414714 4.54362 0.651693 3.98763 0.957031 3.47266C1.26237 2.95312 1.62695 2.48145 2.05078 2.05762C2.47917 1.62923 2.95085 1.26237 3.46582 0.957031C3.98535 0.651693 4.54362 0.416992 5.14062 0.25293C5.73763 0.0843099 6.35742 0 7 0ZM7 13.125C7.5651 13.125 8.10742 13.0521 8.62695 12.9062C9.15104 12.7604 9.63867 12.5553 10.0898 12.291C10.5456 12.0221 10.958 11.7031 11.3271 11.334C11.7008 10.9603 12.0199 10.5479 12.2842 10.0967C12.5531 9.64095 12.7604 9.15332 12.9062 8.63379C13.0521 8.1097 13.125 7.5651 13.125 7C13.125 6.4349 13.0521 5.89258 12.9062 5.37305C12.7604 4.84896 12.5531 4.36133 12.2842 3.91016C12.0199 3.45443 11.7008 3.04199 11.3271 2.67285C10.958 2.29915 10.5456 1.98014 10.0898 1.71582C9.63867 1.44694 9.15104 1.23958 8.62695 1.09375C8.10742 0.947917 7.5651 0.875 7 0.875C6.4349 0.875 5.8903 0.947917 5.36621 1.09375C4.84668 1.23958 4.35905 1.44694 3.90332 1.71582C3.45215 1.98014 3.03971 2.29915 2.66602 2.67285C2.29688 3.04199 1.97786 3.45443 1.70898 3.91016C1.44466 4.36133 1.23958 4.84896 1.09375 5.37305C0.947917 5.89258 0.875 6.4349 0.875 7C0.875 7.5651 0.947917 8.1097 1.09375 8.63379C1.23958 9.15332 1.44466 9.64095 1.70898 10.0967C1.97786 10.5479 2.29688 10.9603 2.66602 11.334C3.03971 11.7031 3.45215 12.0221 3.90332 12.291C4.35905 12.5553 4.84668 12.7604 5.36621 12.9062C5.8903 13.0521 6.4349 13.125 7 13.125ZM4.375 4.375H9.625V9.625H4.375V4.375ZM5.25 8.75H8.75V5.25H5.25V8.75Z"
        fill={fill}
      />
    </svg>
  );
};

const svgByIconName = {
  Friend: FriendSVG,
  MessageBot: MessageBotSVG,
  Stop: StopSVG,
  User: UserSVG,
};

export const Icon = ({ icon, color, size = 18, fill = 'white' }) =>
  svgByIconName[icon] ? (
    <span
      role="icon"
      style={{
        transform: `scale(${size / 18})`,
        width: 18,
        height: 18,
        borderRadius: '37.5px',
        backgroundColor: color || 'black',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {svgByIconName[icon](fill)}
    </span>
  ) : null;
