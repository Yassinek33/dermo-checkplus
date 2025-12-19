import React, { useEffect, useRef } from 'react';

const AuroraBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 -z-50 bg-[#030305] overflow-hidden">
            {/* Mesh Gradient 1 - Cyan/Teal */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2DD4BF] rounded-full blur-[120px] opacity-10 animate-[float_10s_ease-in-out_infinite]" />

            {/* Mesh Gradient 2 - Indigo */}
            <div className="absolute top-[20%] right-[-5%] w-[40%] h-[60%] bg-[#6366F1] rounded-full blur-[140px] opacity-10 animate-[float_15s_ease-in-out_infinite_reverse]" />

            {/* Mesh Gradient 3 - Deep Purple Bottom */}
            <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-[#818CF8] rounded-full blur-[100px] opacity-5" />

            {/* Grid Overlay for Tech Feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
        </div>
    );
};

export default AuroraBackground;
