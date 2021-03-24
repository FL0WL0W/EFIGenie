#include "Operations/Operation_EngineInjectorPrimeArray.h"
#include "Config.h"
using namespace EmbeddedIOServices;

#ifdef OPERATION_ENGINEINJECTORPRIMEARRAY_H
namespace OperationArchitecture
{
	Operation_EngineInjectorPrimeArray::Operation_EngineInjectorPrimeArray(EmbeddedIOServices::ITimerService *timerService, uint8_t length, EmbeddedIOServices::ICallBack **openCallBacks, EmbeddedIOServices::ICallBack **closeCallBacks)
	{
        _length = length;
        _primes = new Operation_EngineInjectorPrime *[_length];

        for(uint8_t i = 0; i < _length; i++)
        {
			_primes[i] = new Operation_EngineInjectorPrime(timerService, openCallBacks[i], closeCallBacks[i]);
		}
	}

	void Operation_EngineInjectorPrimeArray::Execute(float time)
	{
        for(uint8_t i = 0; i < _length; i++)
        {
			_primes[i]->Execute(time);
		}
	}

	IOperationBase *Operation_EngineInjectorPrimeArray::Create(const EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut)
	{
		const uint8_t length = Config::CastAndOffset<uint8_t>(config, sizeOut);
        ICallBack **openCallBacks = new ICallBack*[length];
        ICallBack **closeCallBacks = new ICallBack*[length];
        for(uint8_t i = 0; i < length; i++)
        {
			const uint32_t openOperationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
			const uint32_t closeOperationId = Config::CastAndOffset<uint32_t>(config, sizeOut);
            // openCallBacks[i] = new CallBack<IOperationBase>(, &IOperationBase::Execute);
            // closeCallBacks[i] = new CallBack<IOperationBase>(, &IOperationBase::Execute);
        }

		return new Operation_EngineInjectorPrimeArray(embeddedIOServiceCollection->TimerService, length, openCallBacks, closeCallBacks);
	}
}
#endif