#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "Operations/Operation_EngineScheduleInjection.h"
#include "Operations/Operation_EnginePositionPrediction.h"
#include "Operations/Operation_ScheduleCallBack.h"
#include "ScalarVariable.h"
#include <tuple>

#ifndef OPERATION_ENGINESCHEDULEINJECTTIONARRAY_H
#define OPERATION_ENGINESCHEDULEINJECTTIONARRAY_H
namespace Operations
{
	struct EngineScheduleInjectionArray
	{
		public:
		EngineScheduleInjectionArray(uint8_t length)
		{
			Length = length;
			OpenTick = reinterpret_cast<ScalarVariable*>(malloc(sizeof(ScalarVariable) * Length));
			CloseTick = reinterpret_cast<ScalarVariable*>(malloc(sizeof(ScalarVariable) * Length));
		}

		uint8_t Length;
		ScalarVariable* OpenTick;
		ScalarVariable* CloseTick;
	};

	class Operation_EngineScheduleInjectionArray : public Operations::IOperation<EngineScheduleInjectionArray, EnginePosition, ScalarVariable, ScalarVariable>
	{
	protected:
		uint8_t _length;
		Operation_EngineScheduleInjection **_array;
	public:		
        Operation_EngineScheduleInjectionArray(HardwareAbstraction::ITimerService *timerService, uint8_t length, const float* tdc, IOperation<void, ScalarVariable> **ignitionOutputOperation);

		EngineScheduleInjectionArray Execute(EnginePosition enginePosition, ScalarVariable injectionPulseWidth, ScalarVariable injectionEndPosition) override;

		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif