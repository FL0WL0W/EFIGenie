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

#ifndef OPERATION_ENGINESCHEDULEINJECTION_H
#define OPERATION_ENGINESCHEDULEINJECTION_H
namespace Operations
{
	class Operation_EngineScheduleInjection : public Operations::IOperation<std::tuple<ScalarVariable, ScalarVariable>, EnginePosition, ScalarVariable, ScalarVariable>
	{
	protected:
		HardwareAbstraction::ITimerService *_timerService;
		float _tdc;
		Operation_EnginePositionPrediction *_predictor;
		IOperation<void, ScalarVariable> *_injectionOutputOperation;
		HardwareAbstraction::Task *_openTask;
		HardwareAbstraction::Task *_closeTask;
		bool _open = false;
	public:		
        Operation_EngineScheduleInjection(HardwareAbstraction::ITimerService *timerService, float tdc, IOperation<void, ScalarVariable> *injectionOutputOperation);

		std::tuple<ScalarVariable, ScalarVariable> Execute(EnginePosition enginePosition, ScalarVariable injectionPulseWidth, ScalarVariable injectionEndPosition) override;
		void Open();
		void Close();

		static Operations::IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif