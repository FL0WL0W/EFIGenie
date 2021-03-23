// #include "Operations/IOperation.h"
// #include "Service/IService.h"
// #include "Service/ServiceLocator.h"
// #include "Service/HardwareAbstractionServiceBuilder.h"
// #include "Packed.h"
// #include "Interpolation.h"
// #include "Operations/Operation_EngineScheduleInjection.h"
// #include "Operations/Operation_EnginePositionPrediction.h"
// #include "Operations/Operation_ScheduleCallBack.h"
// #include "ScalarVariable.h"
// #include <tuple>

// #ifndef OPERATION_ENGINESCHEDULEINJECTTIONARRAY_H
// #define OPERATION_ENGINESCHEDULEINJECTTIONARRAY_H
// namespace OperationArchitecture
// {
// 	struct EngineScheduleInjectionArray
// 	{
// 		public:
// 		void Initialize(uint8_t length)
// 		{
// 			Length = length;
// 			OpenTick = reinterpret_cast<ScalarVariable*>(malloc(sizeof(ScalarVariable) * Length));
// 			CloseTick = reinterpret_cast<ScalarVariable*>(malloc(sizeof(ScalarVariable) * Length));
// 		}

// 		uint8_t Length;
// 		ScalarVariable* OpenTick;
// 		ScalarVariable* CloseTick;
// 	};

// 	class Operation_EngineScheduleInjectionArray : public IOperation<EngineScheduleInjectionArray, EnginePosition, ScalarVariable, ScalarVariable>
// 	{
// 	protected:
// 		uint8_t _length;
// 		Operation_EngineScheduleInjection **_array;
// 		EngineScheduleInjectionArray _ret;
// 	public:		
//         Operation_EngineScheduleInjectionArray(EmbeddedIOServices::ITimerService *timerService, uint8_t length, const float* tdc, IOperation<void, ScalarVariable> **ignitionOutputOperation);

// 		EngineScheduleInjectionArray Execute(EnginePosition enginePosition, ScalarVariable injectionPulseWidth, ScalarVariable injectionEndPosition) override;

// 		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
// 		ISERVICE_REGISTERFACTORY_H
// 	};
// }
// #endif