mkdir build

copy index-min.html build\index.html

java -jar closure.jar ^
--compilation_level ADVANCED_OPTIMIZATIONS ^
--js framework\js\datatypes\pool.js ^
--js framework\js\datatypes\color.js ^
--js framework\js\datatypes\vector.js ^
--js framework\js\datatypes\matrix.js ^
--js framework\js\gl\shader.js ^
--js framework\js\gl\texture.js ^
--js framework\js\datatypes\material.js ^
--js framework\js\gl\mesh.js ^
--js framework\js\gl\meshdynamic.js ^
--js framework\js\core\resourcemanager.js ^
--js framework\js\core\camera.js ^
--js framework\js\datatypes\light.js ^
--js framework\js\core\entity.js ^
--js framework\js\core\scene.js ^
--js framework\js\imgui\imgui.js ^
--js framework\js\core\frameworkmain.js ^
--js js\renderHelpers.js ^
--js js\guide.js ^
--js js\guideDotProduct.js ^
--js js\guideCrossProduct.js ^
--js js\guideNormalization.js ^
--js js\guideAcceleration.js ^
--js js\guideAngularVelocity.js ^
--js js\guideCollisionAABBLineSegment.js ^
--js js\guideCollisionSAT.js ^
--js js\main.js ^
--js_output_file build\guides.js

pause