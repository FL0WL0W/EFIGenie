#include "Operations/IOperation.h"
#include "Operations/OperationPackager.h"
#include "Operation_EnginePosition.h"
#include "EmbeddedIOServiceCollection.h"
#include <tuple>

#ifndef OPERATION_ENGINESCHEDULEIGNITION_H
#define OPERATION_ENGINESCHEDULEIGNITION_H
namespace OperationArchitecture
{
	class Operation_EngineScheduleIgnition : public IOperation<std::tuple<EmbeddedIOServices::tick_t, EmbeddedIOServices::tick_t>, EnginePosition, bool, float, float, float>
	{
	protected:
		EmbeddedIOServices::ITimerService * const _timerService;
		const float _tdc;
		const std::function<void()> _dwellCallBack;
		const std::function<void()> _igniteCallBack;

		EmbeddedIOServices::Task *_dwellTask;
		EmbeddedIOServices::Task *_igniteTask;
		EmbeddedIOServices::tick_t _lastDwellTick = 0;
		bool _dwelling = false;
	public:		
        Operation_EngineScheduleIgnition(EmbeddedIOServices::ITimerService * const timerService, const float tdc, const std::function<void()> dwellCallBack, const std::function<void()> igniteCallBack);
		~Operation_EngineScheduleIgnition();

		std::tuple<EmbeddedIOServices::tick_t, EmbeddedIOServices::tick_t> Execute(EnginePosition enginePosition, bool enable, float ignitionDwell, float ignitionAdvance, float ignitionDwellMaxDeviation) override;
		void Dwell();
		void Ignite();

		static IOperationBase *Create(const void *config, size_t &sizeOut, const EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, OperationPackager *packager);
	};
}
#endif