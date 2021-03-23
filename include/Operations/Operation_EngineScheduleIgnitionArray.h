// #include "Operations/IOperation.h"
// #include "Service/IService.h"
// #include "Service/ServiceLocator.h"
// #include "Service/HardwareAbstractionServiceBuilder.h"
// #include "Packed.h"
// #include "Interpolation.h"
// #include "Operations/Operation_EngineScheduleIgnition.h"
// #include "Operations/Operation_EnginePositionPrediction.h"
// #include "Operations/Operation_ScheduleCallBack.h"
// #include "ScalarVariable.h"
// #include <tuple>

// #ifndef OPERATION_ENGINESCHEDULEIGNITIONARRAY_H
// #define OPERATION_ENGINESCHEDULEIGNITIONARRAY_H
// namespace OperationArchitecture
// {
// 	struct EngineScheduleIgnitionArray
// 	{
// 		public:
// 		void Initialize(uint8_t length)
// 		{
// 			Length = length;
// 			DwellTick = reinterpret_cast<ScalarVariable*>(malloc(sizeof(ScalarVariable) * Length));
// 			IgnitionTick = reinterpret_cast<ScalarVariable*>(malloc(sizeof(ScalarVariable) * Length));
// 		}

// 		uint8_t Length;
// 		ScalarVariable* DwellTick;
// 		ScalarVariable* IgnitionTick;
// 	};

// 	class Operation_EngineScheduleIgnitionArray : public IOperation<EngineScheduleIgnitionArray, EnginePosition, ScalarVariable, ScalarVariable>
// 	{
// 	protected:
// 		uint8_t _length;
// 		Operation_EngineScheduleIgnition **_array;
// 		EngineScheduleIgnitionArray _ret;
// 	public:		
//         Operation_EngineScheduleIgnitionArray(EmbeddedIOServices::ITimerService *timerService, uint8_t length, const float* tdc, IOperation<void, ScalarVariable> **ignitionOutputOperation);

// 		EngineScheduleIgnitionArray Execute(EnginePosition enginePosition, ScalarVariable ignitionDwell, ScalarVariable ignitionAdvance) override;

// 		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
// 		ISERVICE_REGISTERFACTORY_H
// 	};
// }
// #endif