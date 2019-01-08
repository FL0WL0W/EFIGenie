#ifndef IIDLECONTROLSERVICE_H
#define IIDLECONTROLSERVICE_H
namespace EngineControlServices
{
	class IIdleControlService
	{
	public:
		short RpmError;
		virtual void Tick() = 0;

		static void TickCallBack(void *idleControlService);
	};
}
#endif