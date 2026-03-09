export default () => {
    const router = useRouter();
    if (window.history.state?.back) {
        router.back();
    } else {
        router.push('/');
    }
}
