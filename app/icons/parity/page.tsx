"use client";

import { BuildTools, GameController, GameHouse } from "@/components/icons";

export default function IconParityPage() {
  const sizes = [24, 48, 88];
  const icons = [
    { component: BuildTools, name: "BuildTools", title: "Developer" },
    { component: GameController, name: "GameController", title: "Gamer" },
    { component: GameHouse, name: "GameHouse", title: "Shader House" },
  ];

  return (
    <div className="min-h-dvh bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Icon Stroke Parity Check
        </h1>
        <p className="text-gray-400 text-center mb-12">
          Visual verification that all three icons have identical stroke widths at different sizes
        </p>

        <div className="grid grid-cols-3 gap-8">
          {icons.map(({ component: IconComponent, name, title }) => (
            <div key={name} className="text-center">
              <h2 className="text-xl font-semibold mb-6">{name}</h2>
              
              <div className="space-y-6">
                {sizes.map((size) => (
                  <div key={size} className="flex flex-col items-center">
                    <div 
                      className="bg-gray-800 rounded-lg p-4 flex items-center justify-center"
                      style={{ width: size + 32, height: size + 32 }}
                    >
                      <div style={{ width: size, height: size }}>
                          <IconComponent 
                            className="text-white w-full h-full" 
                            title={title}
                          />
                        </div>
                    </div>
                    <span className="text-sm text-gray-400 mt-2">{size}px</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Specifications</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Stroke width: 2.00px (ICON_STROKE constant)</li>
            <li>• Stroke cap: round</li>
            <li>• Stroke join: round</li>
            <li>• Stroke miter limit: 1</li>
            <li>• vectorEffect: non-scaling-stroke</li>
            <li>• All icons use identical stroke properties</li>
          </ul>
        </div>
      </div>
    </div>
  );
}



