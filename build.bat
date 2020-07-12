mkdir build

copy index-min.html build\index.html

java -jar closure.jar ^
--compilation_level ADVANCED_OPTIMIZATIONS ^
--js framework\js\color.js ^
--js framework\js\vector.js ^
--js framework\js\matrix.js ^
--js framework\js\shader.js ^
--js framework\js\texture.js ^
--js framework\js\material.js ^
--js framework\js\mesh.js ^
--js framework\js\resourcemanager.js ^
--js framework\js\camera.js ^
--js framework\js\entity.js ^
--js framework\js\scene.js ^
--js framework\js\imgui.js ^
--js framework\js\frameworkmain.js ^
--js js\renderHelpers.js ^
--js js\guide.js ^
--js js\guideDotProduct.js ^
--js js\guideNormalization.js ^
--js js\guideAcceleration.js ^
--js js\guideAngularVelocity.js ^
--js js\main.js ^
--js_output_file build\guides.js

pause