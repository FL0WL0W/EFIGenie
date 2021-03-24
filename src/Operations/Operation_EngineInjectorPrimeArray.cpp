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
		    unsigned int size = 0;
            //static_cast<IOperation<void, bool> *>(IOperationBase::Create(serviceLocator, config, size));
            openCallBacks[i] = 0;
            closeCallBacks[i] = 0;
		    Config::OffsetConfig(config, sizeOut, size);
        }

		return new Operation_EngineInjectorPrimeArray(embeddedIOServiceCollection->TimerService, length, openCallBacks, closeCallBacks);
	}
}
#endif