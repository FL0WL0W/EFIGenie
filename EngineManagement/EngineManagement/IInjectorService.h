#define IInjectorServiceExists
namespace EngineManagement
{	
	class IInjectorService
	{
	public:
		virtual void InjectorOpen() = 0;
		virtual void InjectorClose() = 0;
		static void InjectorOpenTask(void *parameters);
		static void InjectorCloseTask(void *parameters);
	};

	extern IInjectorService *CurrentInjectorServices[MAX_CYLINDERS];
}