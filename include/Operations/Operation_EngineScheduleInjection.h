#include "Operations/IOperation.h"
#include "Operation_EnginePosition.h"
#include "EmbeddedIOServiceCollection.h"
#include "Operations/OperationPackager.h"
#include <tuple>

#ifndef OPERATION_ENGINESCHEDULEINJECTION_H
#define OPERATION_ENGINESCHEDULEINJECTION_H
namespace OperationArchitecture
{
	class Operation_EngineScheduleInjection : public IOperation<std::tuple<EmbeddedIOServices::tick_t, EmbeddedIOServices::tick_t>, EnginePosition, bool, float, float>
	{
	protected:
		EmbeddedIOServices::ITimerService * const _timerService;
		const float _tdc;
		const std::function<void()> _openCallBack;
		const std::function<void()> _closeCallBack;

		EmbeddedIOServices::Task *_openTask;
		EmbeddedIOServices::Task *_closeTask;
		EmbeddedIOServices::tick_t _lastOpenedAtTick = 0;
		bool _open = false;
	public:		
        Operation_EngineScheduleInjection(EmbeddedIOServices::ITimerService * const timerService, const float _tdc, const std::function<void()> openCallBack, const std::function<void()> closeCallBack);
		~Operation_EngineScheduleInjection();

		std::tuple<EmbeddedIOServices::tick_t, EmbeddedIOServices::tick_t> Execute(EnginePosition enginePosition, bool enable, float injectionPulseWidth, float injectionEndPosition) override;
		void Open();
		void Close();

		static IOperationBase *Create(const void *config, size_t &sizeOut, const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager);
	};
}
#endif