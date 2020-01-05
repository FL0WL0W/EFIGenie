#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Packed.h"
#include "Interpolation.h"
#include "Operations/Operation_EnginePositionPrediction.h"
#include "Operations/Operation_ScheduleCallBack.h"
#include "ScalarVariable.h"
#include <tuple>

#ifndef OPERATION_ENGINESCHEDULEIGNITION_H
#define OPERATION_ENGINESCHEDULEIGNITION_H
namespace Operations
{
	class Operation_EngineScheduleIgnition : public Operations::IOperation<std::tuple<ScalarVariable, ScalarVariable>, EnginePosition, ScalarVariable, ScalarVariable>
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
		float _tdc;
		Operation_EnginePositionPrediction *_predictor;
		IOperation<void, ScalarVariable> *_ignitionOutputOperation;
		HardwareAbstraction::Task *_dwellTask;
		HardwareAbstraction::Task *_igniteTask;
		uint32_t _dwellingAtTick = 0;
		ScalarVariable _ignitionAt;
	public:		
        Operation_EngineScheduleIgnition(HardwareAbstraction::ITimerService *timerService, float tdc, IOperation<void, ScalarVariable> *ignitionOutputOperation);

		std::tuple<ScalarVariable, ScalarVariable> Execute(EnginePosition enginePosition, ScalarVariable ignitionDwell, ScalarVariable ignitionAdvance) override;
		void Dwell();
		void Ignite();

		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif