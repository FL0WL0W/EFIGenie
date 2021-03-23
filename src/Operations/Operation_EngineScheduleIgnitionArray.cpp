#include "Operations/Operation_EngineScheduleIgnitionArray.h"

#ifdef OPERATION_ENGINESCHEDULEIGNITIONARRAY_H
namespace OperationArchitecture
{
	Operation_EngineScheduleIgnitionArray::Operation_EngineScheduleIgnitionArray(EmbeddedIOServices::ITimerService *timerService, uint8_t length, const float *tdc, IOperation<void, ScalarVariable> **ignitionOutputOperation)
	{
        _length = length;
        _array = reinterpret_cast<Operation_EngineScheduleIgnition **>(malloc(sizeof(Operation_EngineScheduleIgnition *) * _length));

        for(uint8_t i = 0; i < _length; i++)
        {
            _array[i] = new Operation_EngineScheduleIgnition(timerService, tdc[i], ignitionOutputOperation[i]);
        }

        _ret.Initialize(_length);
	}

	EngineScheduleIgnitionArray Operation_EngineScheduleIgnitionArray::Execute(EnginePosition enginePosition, ScalarVariable ignitionDwell, ScalarVariable ignitionAdvance)
	{
        for(uint8_t i = 0; i < _length; i++)
        {
            std::tuple<ScalarVariable, ScalarVariable> ex = _array[i]->Execute(enginePosition, ignitionDwell, ignitionAdvance);
            _ret.DwellTick[i] = std::get<0>(ex);
            _ret.IgnitionTick[i] = std::get<1>(ex);
        }

        return _ret;
	}

	IOperationBase *Operation_EngineScheduleIgnitionArray::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		EmbeddedIOServices::ITimerService * const timerService = serviceLocator->LocateAndCast<HardwareAbstraction::ITimerService>(TIMER_SERVICE_ID);
		const uint8_t length = IService::CastAndOffset<uint8_t>(config, sizeOut);
		const float *tdc = reinterpret_cast<const float *>(config);
        IService::OffsetConfig(config, sizeOut, sizeof(float) * length);
        IOperation<void, ScalarVariable> **ignitionOutputOperation = reinterpret_cast<IOperation<void, ScalarVariable> **>(malloc(sizeof(IOperation<void, ScalarVariable> *) * length));
        for(uint8_t i = 0; i < length; i++)
        {
		    unsigned int size = 0;
            ignitionOutputOperation[i] = static_cast<IOperation<void, ScalarVariable> *>(IOperationBase::Create(serviceLocator, config, size));
		    OffsetConfig(config, sizeOut, size);
        }

		return new Operation_EngineScheduleIgnitionArray(timerService, length, tdc, ignitionOutputOperation);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_EngineScheduleIgnitionArray, 2006)
}
#endif