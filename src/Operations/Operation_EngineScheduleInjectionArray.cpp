#include "Operations/Operation_EngineScheduleInjectionArray.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINESCHEDULEINJECTTIONARRAY_H
namespace OperationArchitecture
{
	Operation_EngineScheduleInjectionArray::Operation_EngineScheduleInjectionArray(EmbeddedIOServices::ITimerService *timerService, Operation_EnginePositionPrediction *predictor, uint8_t length, const float* tdc, ICallBack **openCallBacks, ICallBack **closeCallBacks)
	{
        _length = length;
        _array = reinterpret_cast<Operation_EngineScheduleInjection **>(malloc(sizeof(Operation_EngineScheduleInjection *) * _length));

        for(uint8_t i = 0; i < _length; i++)
        {
            _array[i] = new Operation_EngineScheduleInjection(timerService, predictor, tdc[i], openCallBacks[i], closeCallBacks[i]);
        }

        _ret.Initialize(_length);
	}

	EngineScheduleInjectionArray Operation_EngineScheduleInjectionArray::Execute(EnginePosition enginePosition, float injectionPulseWidth, float injectionEndPosition)
	{
        for(uint8_t i = 0; i < _length; i++)
        {
            std::tuple<float, float> ex = _array[i]->Execute(enginePosition, injectionPulseWidth, injectionEndPosition);
            _ret.OpenTick[i] = std::get<0>(ex);
            _ret.CloseTick[i] = std::get<1>(ex);
        }

        return _ret;
	}

	static IOperationBase *Create(const EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
	{
		const uint8_t length = Config::CastAndOffset<uint8_t>(config, sizeOut);
		const float *tdc = reinterpret_cast<const float *>(config);
        Config::OffsetConfig(config, sizeOut, sizeof(float) * length);
        ICallBack **openCallBacks = new ICallBack*[length];
        ICallBack **closeCallBacks = new ICallBack*[length];
        for(uint8_t i = 0; i < length; i++)
        {
		    unsigned int size = 0;
            //static_cast<IOperation<void, bool> *>(IOperationBase::Create(serviceLocator, config, size));
            openCallBacks[i] = 0;
            closeCallBacks[i] = 0;
		    Config::OffsetConfig(config, sizeOut, size);
        }

		return new Operation_EngineScheduleInjectionArray(embeddedIOServiceCollection->TimerService, new Operation_EnginePositionPrediction(embeddedIOServiceCollection->TimerService), length, tdc, openCallBacks, closeCallBacks);
	}
}
#endif