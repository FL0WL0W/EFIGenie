// #include "Service/ServiceLocator.h"
// #include "Service/ServiceBuilder.h"

// //hardwareabstraction includes
// #include "HardwareAbstraction/HardwareAbstractionCollection.h"

// //IOService Inlcudes
// #include "IOServices/FloatInputService/IFloatInputService.h"
// #include "IOServices/BooleanInputService/IBooleanInputService.h"
// #include "IOServices/ButtonService/IButtonService.h"
// #include "IOServices/FloatOutputService/IFloatOutputService.h"
// #include "IOServices/BooleanOutputService/IBooleanOutputService.h"
// #include "IOServices/StepperOutputService/IStepperOutputService.h"

// //Reluctor
// #include "Reluctor/IReluctor.h"
// #include "Reluctor/Gm24xReluctor.h"
// #include "Reluctor/Universal2xReluctor.h"

// //EngineControlServices Includes

// using namespace HardwareAbstraction;
// using namespace IOServices;
// using namespace EngineControlServices;
// using namespace Reluctor;

// //outputs 3001-4000
// #define BUILDER_IBOOLEANOUTPUTSERVICEARRAY			3004
// #define INSTANCE_IGNITORS							0			// IBooleanOutputService[]
// #define INSTANCE_INJECTORS							1			// IBooleanOutputService[]

// //application services 4001-5000
// #define BUILDER_IIGNITIONSCHEDULINGSERVICE			4001			// IgnitionSchedulingService
// #define BUILDER_IINJECTIONSCHEDULINGSERVICE			4002			// InjectionSchedulingService

// //callback groups 5001-6000
// #define PRE_RELUCTOR_SYNC_CALL_BACK_GROUP		5002
// #define POST_RELUCTOR_SYNC_CALL_BACK_GROUP		5003

// namespace Service
// {
// 	class EngineControlServicesServiceBuilderRegister
// 	{
// 	public:
// 		static void Register(ServiceBuilder *&serviceBuilder);
// 		static ServiceLocator *CreateServices(ServiceLocator *serviceLocator, HardwareAbstractionCollection *hardwareAbstractionCollection, const void *config, unsigned int &totalSize);
		
// 		static void* CreateBooleanOutputArray(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
// 		static void* CreateIgnitionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
// 		static void* CreateInjectionSchedulingService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
// 	};
// }
