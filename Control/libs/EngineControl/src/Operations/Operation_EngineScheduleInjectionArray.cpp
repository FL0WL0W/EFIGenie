#include "Operations/Operation_EngineScheduleInjectionArray.h"

#ifdef OPERATION_ENGINESCHEDULEINJECTTIONARRAY_H
namespace Operations
{
	Operation_EngineScheduleInjectionArray::Operation_EngineScheduleInjectionArray(HardwareAbstraction::ITimerService *timerService, uint8_t length, const float *tdc, IOperation<void, ScalarVariable> **ignitionOutputOperation)
	{
        _length = length;
        _array = reinterpret_cast<Operation_EngineScheduleInjection **>(malloc(sizeof(Operation_EngineScheduleInjection *) * _length));

        for(uint8_t i = 0; i < _length; i++)
        {
            _array[i] = new Operation_EngineScheduleInjection(timerService, tdc[i], ignitionOutputOperation[i]);
        }

        _ret.Initialize(_length);
	}

	EngineScheduleInjectionArray Operation_EngineScheduleInjectionArray::Execute(EnginePosition enginePosition, ScalarVariable ignitionDwell, ScalarVariable ignitionAdvance)
	{
        for(uint8_t i = 0; i < _length; i++)
        {
            std::tuple<ScalarVariable, ScalarVariable> ex = _array[i]->Execute(enginePosition, ignitionDwell, ignitionAdvance);
            //_ret.OpenTick[i] = std::get<0>(ex);
            //_ret.CloseTick[i] = std::get<1>(ex);
        }

        return _ret;
	}

	Operations::IOperationBase *Operation_EngineScheduleInjectionArray::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		HardwareAbstraction::ITimerService * const timerService = serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID);
		const uint8_t length = IService::CastAndOffset<uint8_t>(config, sizeOut);
		const float *tdc = reinterpret_cast<const float *>(config);
        IService::OffsetConfig(config, sizeOut, sizeof(float) * length);
        Operations::IOperation<void, ScalarVariable> **ignitionOutputOperation = reinterpret_cast<Operations::IOperation<void, ScalarVariable> **>(malloc(sizeof(Operations::IOperation<void, ScalarVariable> *) * length));
        for(uint8_t i = 0; i < length; i++)
        {
		    unsigned int size = 0;
            ignitionOutputOperation[i] = reinterpret_cast<Operations::IOperation<void, ScalarVariable> *>(IOperationBase::Create(serviceLocator, config, size));
		    OffsetConfig(config, sizeOut, size);
        }

		return new Operation_EngineScheduleInjectionArray(timerService, length, tdc, ignitionOutputOperation);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_EngineScheduleInjectionArray, 2006)
}
#endif