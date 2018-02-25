#if defined (IInjectorServiceExists)
#define InjectorServiceExists
namespace EngineManagement
{
	class InjectorService : public IInjectorService
	{
	protected:
		unsigned char _injectorPin;
		bool _normalOn;
		bool _highZ;
	public:
		InjectorService(unsigned char injectorPin, bool normalOn, bool highZ);
		void InjectorOpen();
		void InjectorClose();
	};
}
#endif